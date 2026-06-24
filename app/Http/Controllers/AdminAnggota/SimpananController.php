<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\Simpanan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SimpananController extends Controller
{
    public function index()
    {
        $anggota = Anggota::whereIn('status_keanggotaan', ['aktif', 'pasif'])
            ->with('simpanan')
            ->get()
            ->map(function ($a) {
                $pokok = $a->simpanan->where('jenis_simpanan', 'pokok')->sum('jumlah');
                $wajib = $a->simpanan->where('jenis_simpanan', 'wajib')->sum('jumlah');
                $pengambilan = $a->simpanan->where('jenis_simpanan', 'pengambilan')->sum('jumlah');
                return [
                    'id_anggota' => $a->id_anggota,
                    'nama_lengkap' => $a->nama_lengkap,
                    'pokok' => $pokok,
                    'wajib' => $wajib,
                    'saldo' => ($pokok + $wajib) - $pengambilan,
                ];
            });

        return Inertia::render('AdminAnggota/Simpanan/Index', ['rekapSimpanan' => $anggota]);
    }

    public function create()
    {
        // Kirim daftar anggota aktif/pasif ke form untuk dipilih di dropdown
        $anggota = Anggota::whereIn('status_keanggotaan', ['aktif', 'pasif'])
            ->select('id_anggota', 'nama_lengkap', 'nik')
            ->get();
            
        return Inertia::render('AdminAnggota/Simpanan/Create', ['daftarAnggota' => $anggota]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_anggota' => 'required|exists:tb_anggota,id_anggota',
            'jenis_simpanan' => 'required|in:pokok,wajib,pengambilan',
            'jumlah' => 'required|numeric|min:1',
            'tanggal_transaksi' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        $validated['id_pengguna'] = Auth::id() ?? 1;

        // Validasi khusus pengambilan: cek apakah saldo cukup (Sesuai SKPL UC05)
        if ($validated['jenis_simpanan'] === 'pengambilan') {
            $simpanan = Simpanan::where('id_anggota', $validated['id_anggota'])->get();
            $saldo = ($simpanan->whereIn('jenis_simpanan', ['pokok', 'wajib'])->sum('jumlah')) 
                     - $simpanan->where('jenis_simpanan', 'pengambilan')->sum('jumlah');
            
            if ($validated['jumlah'] > $saldo) {
                return back()->withErrors(['jumlah' => 'Saldo tidak mencukupi untuk pengambilan ini.']);
            }
        }

        Simpanan::create($validated);
        return redirect()->route('admin-anggota.simpanan.index')->with('success', 'Transaksi berhasil disimpan.');
    }

    public function show($id)
    {
        // Tarik data anggota beserta riwayat transaksinya
        $anggota = Anggota::with(['simpanan' => function($q) {
            $q->orderBy('tanggal_transaksi', 'desc')->orderBy('dibuat_pada', 'desc');
        }])->findOrFail($id);

        $pokok = $anggota->simpanan->where('jenis_simpanan', 'pokok')->sum('jumlah');
        $wajib = $anggota->simpanan->where('jenis_simpanan', 'wajib')->sum('jumlah');
        $pengambilan = $anggota->simpanan->where('jenis_simpanan', 'pengambilan')->sum('jumlah');

        return Inertia::render('AdminAnggota/Simpanan/Show', [
            'anggota' => $anggota,
            'riwayat' => $anggota->simpanan,
            'totals' => [
                'pokok' => $pokok,
                'wajib' => $wajib,
                'pengambilan' => $pengambilan,
                'saldo' => ($pokok + $wajib) - $pengambilan
            ]
        ]);
    }

    public function edit($id)
    {
        // Edit spesifik per TRANSAKSI, bukan per anggota
        $simpanan = Simpanan::with('anggota')->findOrFail($id);
        return Inertia::render('AdminAnggota/Simpanan/Edit', ['simpanan' => $simpanan]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'jenis_simpanan' => 'required|in:pokok,wajib,pengambilan',
            'jumlah' => 'required|numeric|min:1',
            'tanggal_transaksi' => 'required|date',
            'keterangan' => 'nullable|string',
        ]);

        $simpanan = Simpanan::findOrFail($id);
        $simpanan->update($validated);

        // Redirect balik ke halaman Detail Anggota tersebut
        return redirect()->route('admin-anggota.simpanan.show', $simpanan->id_anggota)
                         ->with('success', 'Transaksi berhasil diupdate.');
    }
}