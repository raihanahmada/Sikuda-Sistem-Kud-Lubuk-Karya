<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnggotaController extends Controller
{
    // Status yang boleh muncul di halaman ini. Kalau ada data dengan status
    // di luar daftar ini (misal "menunggu", "ditolak", atau null), datanya
    // tidak akan pernah ditampilkan maupun dihitung di halaman ini.
    private const STATUS_VALID = ['aktif', 'pasif', 'tidak_aktif'];

    public function index(Request $request)
    {
        $cari   = $request->input('cari');
        $status = $request->input('status');

        $query = Anggota::query()
            ->whereIn('status_keanggotaan', self::STATUS_VALID)
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

        // ── Filter status keanggotaan (menerima: aktif, pasif, tidak_aktif) ──
        // Kalau $status diisi tapi bukan salah satu dari 3 status valid,
        // diabaikan saja (tetap fallback ke whereIn di atas).
        if ($status && in_array($status, self::STATUS_VALID)) {
            $query->where('status_keanggotaan', $status);
        }

        $anggota = $query->get();

        // Statistik tetap dihitung dari SELURUH data (bukan hasil yang sudah
        // difilter pencarian), supaya angka di card statistik konsisten /
        // tidak ikut berubah-ubah cuma karena user mengetik di kolom search.
        // Tapi tetap dibatasi ke 3 status valid, biar "total" selalu sama
        // dengan aktif + pasif + tidak_aktif.
        $semuaAnggota = Anggota::whereIn('status_keanggotaan', self::STATUS_VALID)
            ->select('status_keanggotaan')
            ->get();

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