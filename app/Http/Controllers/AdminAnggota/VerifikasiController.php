<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\Simpanan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VerifikasiController extends Controller
{
    public function index(Request $request)
    {
        $query = Anggota::where('status_keanggotaan', 'menunggu_verifikasi');

        // ===== PENERAPAN MATERI: useEffect Search Server-Side (Pertemuan 11) =====
        if ($request->filled('search')) {
            $query->where('nama_lengkap', 'like', "%{$request->search}%");
        }
        // ===== AKHIR PENERAPAN =====

        // ===== PENERAPAN MATERI: Pagination Server-Side (pola sama seperti Admin Keuangan, 10 data/halaman) =====
        // dataPendaftaran di-eager-load supaya dokumen (KK/KTP/Surat Pernyataan) sudah ikut
        // di tiap baris tanpa perlu request tambahan saat popup Detail dibuka.
        // Anggota yang paling baru mendaftar tampil paling atas
        $antrian = $query->with('dataPendaftaran')
            ->orderByDesc('tanggal_daftar')->orderByDesc('id_anggota')
            ->paginate(10)->withQueryString();
        // ===== AKHIR PENERAPAN =====

        $stats = [
            'menunggu' => Anggota::where('status_keanggotaan', 'menunggu_verifikasi')->count(),
            'diterima' => Anggota::where('status_keanggotaan', 'aktif')->whereDate('tanggal_verifikasi', today())->count(),
            'ditolak' => Anggota::where('status_keanggotaan', 'ditolak')->whereDate('tanggal_verifikasi', today())->count(),
        ];

        return Inertia::render('AdminAnggota/Verifikasi/Index', [
            'antrian' => $antrian,
            'stats' => $stats,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show($id)
    {
        $anggota = Anggota::with('dataPendaftaran')->findOrFail($id);
        return Inertia::render('AdminAnggota/Verifikasi/Show', ['anggota' => $anggota]);
    }

    public function terima($id)
    {
        $anggota = Anggota::findOrFail($id);
        $anggota->update([
            'status_keanggotaan' => 'aktif',
            'tanggal_verifikasi' => now()
        ]);
        Simpanan::create([
            'id_anggota' => $anggota->id_anggota,
            'jenis_simpanan' => 'pokok',
            'jumlah' => 100000,
            'tanggal_transaksi' => now(),
            'keterangan' => 'Simpanan Pokok Anggota Baru (Otomatis)',
            'id_pengguna' => Auth::id() ?? 1
        ]);
        return back()->with('sukses', 'Anggota berhasil diterima!');
    }

    public function tolak(Request $request, $id)
    {
        $request->validate(['alasan_penolakan' => 'required|string']);
        $anggota = Anggota::findOrFail($id);
        $anggota->update([
            'status_keanggotaan' => 'ditolak',
            'tanggal_verifikasi' => now(),
            'alasan_penolakan' => $request->alasan_penolakan
        ]);
        return back()->with('sukses', 'Anggota ditolak!');
    }
}