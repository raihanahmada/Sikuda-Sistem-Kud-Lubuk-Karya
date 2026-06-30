<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnggotaController extends Controller
{
    public function index(Request $request)
    {
        $cari   = $request->input('cari');
        $status = $request->input('status');

        $query = Anggota::query()
            ->orderBy('tanggal_daftar', 'desc')
            ->select([
                'id_anggota',
                'nik',
                'nama_lengkap',
                'alamat',
                'no_telepon',
                'status_keanggotaan',
                'tanggal_daftar',
                'tanggal_verifikasi',
                'no_surat_permohonan',
            ]);

        // ── Filter pencarian: nama, NIK, atau no. surat permohonan ──────────
        if ($cari) {
            $query->where(function ($q) use ($cari) {
                $q->where('nama_lengkap', 'like', "%{$cari}%")
                  ->orWhere('nik', 'like', "%{$cari}%")
                  ->orWhere('no_surat_permohonan', 'like', "%{$cari}%");
            });
        }

        // ── Filter status keanggotaan (sekarang menerima: aktif, pasif, tidak_aktif) ──
        if ($status) {
            $query->where('status_keanggotaan', $status);
        }

        $anggota = $query->get();

        // Statistik tetap dihitung dari SELURUH data (bukan hasil yang sudah
        // difilter), supaya angka di card statistik konsisten / tidak ikut
        // berubah-ubah cuma karena user mengetik di kolom search.
        $semuaAnggota = Anggota::select('status_keanggotaan')->get();

        // ── PERBAIKAN: 'pasif' sebelumnya salah menghitung status 'tidak_aktif'.
        // Sekarang masing-masing status dihitung benar-benar sesuai namanya.
        $statistik = [
            'total'       => $semuaAnggota->count(),
            'aktif'       => $semuaAnggota->where('status_keanggotaan', 'aktif')->count(),
            'pasif'       => $semuaAnggota->where('status_keanggotaan', 'pasif')->count(),
            'tidak_aktif' => $semuaAnggota->where('status_keanggotaan', 'tidak_aktif')->count(),
        ];

        return Inertia::render('Pemilik/Anggota', [
            'anggota'   => $anggota,
            'statistik' => $statistik,
        ]);
    }
}