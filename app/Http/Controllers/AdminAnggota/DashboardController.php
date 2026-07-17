<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ===== PENERAPAN MATERI: Data real dari database =====
        $stats = [
            'total_anggota'       => DB::table('tb_anggota')->count(),
            'aktif'               => DB::table('tb_anggota')
                                        ->where('status_keanggotaan', 'aktif')
                                        ->count(),
            'pasif'               => DB::table('tb_anggota')
                                        ->where('status_keanggotaan', 'pasif')
                                        ->count(),
            'anggota_baru'        => DB::table('tb_anggota')
                                        ->whereMonth('tanggal_daftar', now()->month)
                                        ->whereYear('tanggal_daftar', now()->year)
                                        ->count(),
            'menunggu_verifikasi' => DB::table('tb_anggota')
                                        ->where('status_keanggotaan', 'menunggu_verifikasi')
                                        ->count(),
        ];

        // ===== PENERAPAN MATERI: Grafik Pertumbuhan Anggota per Status (12 bulan terakhir) =====
        // Setiap titik bulan menghitung, dari anggota yang mendaftar pada bulan itu,
        // berapa yang statusnya sekarang aktif / pasif / keluar.
        $grafikPertumbuhan = [];
        for ($i = 11; $i >= 0; $i--) {
            $bulan = now()->subMonths($i);

            $grafikPertumbuhan[] = [
                'bulan' => $bulan->format('M y'),
                'aktif' => DB::table('tb_anggota')
                            ->whereMonth('tanggal_daftar', $bulan->month)
                            ->whereYear('tanggal_daftar', $bulan->year)
                            ->where('status_keanggotaan', 'aktif')
                            ->count(),
                'pasif' => DB::table('tb_anggota')
                            ->whereMonth('tanggal_daftar', $bulan->month)
                            ->whereYear('tanggal_daftar', $bulan->year)
                            ->where('status_keanggotaan', 'pasif')
                            ->count(),
                'keluar' => DB::table('tb_anggota')
                            ->whereMonth('tanggal_daftar', $bulan->month)
                            ->whereYear('tanggal_daftar', $bulan->year)
                            ->where('status_keanggotaan', 'keluar')
                            ->count(),
            ];
        }
        // ===== AKHIR PENERAPAN =====

        // ===== Aktivitas terbaru dari tb_anggota =====
        $aktivitas = DB::table('tb_anggota')
            ->select(
                'nama_lengkap',
                'status_keanggotaan',
                'tanggal_daftar',
                'tanggal_verifikasi',
                'dibuat_pada',
                'diperbarui_pada'
            )
            ->orderBy('diperbarui_pada', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                if ($item->status_keanggotaan === 'aktif' && $item->tanggal_verifikasi) {
                    $jenis = 'Verifikasi';
                    $waktu = \Carbon\Carbon::parse($item->tanggal_verifikasi)->format('d M Y');
                } elseif ($item->status_keanggotaan === 'menunggu_verifikasi') {
                    $jenis = 'Pendaftaran';
                    $waktu = \Carbon\Carbon::parse($item->tanggal_daftar)->format('d M Y');
                } else {
                    $jenis = 'Update';
                    $waktu = \Carbon\Carbon::parse($item->diperbarui_pada ?? $item->dibuat_pada)->format('d M Y');
                }

                return [
                    'nama'   => $item->nama_lengkap,
                    'status' => $item->status_keanggotaan,
                    'jenis'  => $jenis,
                    'waktu'  => $waktu,
                ];
            });

        return Inertia::render('AdminAnggota/Dashboard', [
            'stats'             => $stats,
            'grafikPertumbuhan' => $grafikPertumbuhan,
            'aktivitas'         => $aktivitas,
        ]);
    }
}