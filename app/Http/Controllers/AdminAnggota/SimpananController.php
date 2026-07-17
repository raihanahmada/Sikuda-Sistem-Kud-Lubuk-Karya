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
    public function index(Request $request)
    {
        // ===== PENERAPAN MATERI: useEffect Search Server-Side (Pertemuan 11) =====
        // Query anggota dengan filter search nama sebelum map()
        $query = Anggota::whereIn('status_keanggotaan', ['aktif', 'pasif']);

        if ($request->filled('search')) {
            $query->where('nama_lengkap', 'like', "%{$request->search}%");
        }
        // ===== AKHIR PENERAPAN =====

        // ===== PENERAPAN MATERI: Pagination Server-Side (pola sama seperti Admin Keuangan, 10 data/halaman) =====
        $anggota = $query->with(['simpanan' => function ($q) {
                $q->orderBy('tanggal_transaksi', 'desc')->orderBy('dibuat_pada', 'desc');
            }])
            ->orderBy('nama_lengkap')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($a) {
                $pokok = $a->simpanan->where('jenis_simpanan', 'pokok')->sum('jumlah');
                $wajib = $a->simpanan->where('jenis_simpanan', 'wajib')->sum('jumlah');
                $pengambilan = $a->simpanan->where('jenis_simpanan', 'pengambilan')->sum('jumlah');
                return [
                    'id_anggota' => $a->id_anggota,
                    'nik' => $a->nik,
                    'nama_lengkap' => $a->nama_lengkap,
                    'pokok' => $pokok,
                    'wajib' => $wajib,
                    'pengambilan' => $pengambilan,
                    'saldo' => ($pokok + $wajib) - $pengambilan,
                    'riwayat' => $a->simpanan->values(),
                ];
            });
        // ===== AKHIR PENERAPAN =====

        // Daftar anggota untuk dropdown "Tambah Simpanan" — sama seperti method create() sebelumnya,
        // dipindah ke sini supaya sudah tersedia begitu popup Tambah dibuka (tanpa perlu request baru)
        $daftarAnggota = Anggota::whereIn('status_keanggotaan', ['aktif', 'pasif'])
            ->select('id_anggota', 'nama_lengkap', 'nik')
            ->get();

        return Inertia::render('AdminAnggota/Simpanan/Index', [
            'rekapSimpanan' => $anggota,
            'daftarAnggota' => $daftarAnggota,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
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

        if ($validated['jenis_simpanan'] === 'pengambilan') {
            $simpanan = Simpanan::where('id_anggota', $validated['id_anggota'])->get();
            $saldo = ($simpanan->whereIn('jenis_simpanan', ['pokok', 'wajib'])->sum('jumlah'))
                     - $simpanan->where('jenis_simpanan', 'pengambilan')->sum('jumlah');
            if ($validated['jumlah'] > $saldo) {
                return back()->withErrors(['jumlah' => 'Saldo tidak mencukupi untuk pengambilan ini.']);
            }
        }

        Simpanan::create($validated);
        return back()->with('sukses', 'Transaksi berhasil disimpan.');
    }

    public function show($id)
    {
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
        return back()->with('sukses', 'Transaksi berhasil diupdate.');
    }
}