<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller; // ← ini yang kurang!
use Inertia\Inertia;
use App\Models\TransaksiKas;
use App\Models\Simpanan;
use App\Models\Anggota;
use App\Models\PenjualanTbs;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $kasMasuk  = TransaksiKas::where('jenis_kas', 'masuk')->sum('nominal');
        $kasKeluar = TransaksiKas::where('jenis_kas', 'keluar')->sum('nominal');
        $saldoAkhir = $kasMasuk - $kasKeluar;

        $totalSimpanan = Simpanan::sum('jumlah');

        $anggotaAktif = Anggota::where('status_keanggotaan', 'aktif')->count();
        $anggotaPasif = Anggota::where('status_keanggotaan', 'tidak_aktif')->count();

        $totalBeratTbs = PenjualanTbs::whereMonth('tanggal_timbang', date('m'))->sum('berat_bersih_kg');

        $grafikArusKas = TransaksiKas::select(
                DB::raw('DATE(tanggal_transaksi) as tanggal'),
                DB::raw('SUM(CASE WHEN jenis_kas = "masuk" THEN nominal ELSE 0 END) as pemasukan'),
                DB::raw('SUM(CASE WHEN jenis_kas = "keluar" THEN nominal ELSE 0 END) as pengeluaran')
            )
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->limit(30)
            ->get();

        return Inertia::render('Pemilik/Dashboard', [
            'ringkasanKas' => [
                'totalMasuk'  => $kasMasuk,
                'totalKeluar' => $kasKeluar,
                'saldoAkhir'  => $saldoAkhir,
            ],
            'totalSimpanan'    => $totalSimpanan,
            'statistikAnggota' => [
                'total' => $anggotaAktif + $anggotaPasif,
                'aktif' => $anggotaAktif,
                'pasif' => $anggotaPasif,
            ],
            'performaTbs'  => [
                'totalBerat' => $totalBeratTbs,
            ],
            'grafikArusKas' => $grafikArusKas,
        ]);
    }
}