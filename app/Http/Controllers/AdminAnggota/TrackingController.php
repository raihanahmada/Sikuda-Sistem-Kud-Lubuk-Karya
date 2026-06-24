<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\PenjualanTbs; // Pastikan model ini ada
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TrackingController extends Controller
{
    public function index()
    {
        // Mengambil semua anggota yang statusnya 'aktif'
        $anggota = Anggota::where('status_keanggotaan', 'aktif')->get();

        $dataTracking = $anggota->map(function ($a) {
            // Hitung total TBS berdasarkan kolom 'berat_bersih_kg' di tabel 'tb_penjualan_tbs'
            $totalTbs = PenjualanTbs::where('id_anggota', $a->id_anggota)->sum('berat_bersih_kg');
            
            // Cari transaksi terakhir berdasarkan kolom 'tanggal_timbang'
            $terakhirTransaksi = PenjualanTbs::where('id_anggota', $a->id_anggota)
                ->latest('tanggal_timbang')
                ->first();

            // Logika evaluasi status:
            // Jika tidak ada transaksi dalam 3 bulan terakhir, tandai sebagai "Perlu Evaluasi"
            $statusEvaluasi = "Aktif";
            if ($terakhirTransaksi) {
                $tigaBulanLalu = Carbon::now()->subMonths(3);
                if (Carbon::parse($terakhirTransaksi->tanggal_timbang)->lt($tigaBulanLalu)) {
                    $statusEvaluasi = "Pasif (3 Bulan Tidak Transaksi)";
                }
            } else {
                $statusEvaluasi = "Belum Ada Transaksi";
            }

            return [
                'id_anggota' => $a->id_anggota,
                'nama_lengkap' => $a->nama_lengkap,
                'total_tbs' => $totalTbs,
                'terakhir_aktif' => $terakhirTransaksi ? $terakhirTransaksi->tanggal_timbang : 'Belum ada',
                'status_evaluasi' => $statusEvaluasi
            ];
        });

        return Inertia::render('AdminAnggota/Tracking/Index', [
            'dataTracking' => $dataTracking
        ]);
    }

    public function show($id)
    {
        $anggota = Anggota::withCount(['penjualanTbs as penjualan_count'])->findOrFail($id);

        return Inertia::render('AdminAnggota/Tracking/Show', [
            'anggota' => $anggota
        ]);
    }
}