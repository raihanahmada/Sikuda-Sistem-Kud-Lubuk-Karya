<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TransaksiKas;
use App\Models\Simpanan;
use App\Models\Anggota;
use App\Models\PenjualanTbs;
use App\Models\HargaTbs;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $totalSimpanan = Simpanan::sum('jumlah');

        $anggotaAktif = Anggota::where('status_keanggotaan', 'aktif')->count();
        $anggotaPasif = Anggota::where('status_keanggotaan', 'tidak_aktif')->count();

        // ─── Tentukan rentang tanggal berdasarkan parameter periode ───────────
        // Default: bulan & tahun saat ini (kalau tidak ada parameter dikirim)
        $periode      = $request->input('periode', 'bulan'); // 'bulan' | 'tahun'
        $tahun        = (int) $request->input('tahun', now()->year);
        $bulan        = (int) $request->input('bulan', now()->month);
        $tanggalMulai = $request->input('tanggal_mulai');
        $tanggalAkhir = $request->input('tanggal_akhir');

        if ($tanggalMulai && $tanggalAkhir) {
            // Rentang tanggal kustom (prioritas paling tinggi)
            $awal  = Carbon::parse($tanggalMulai)->startOfDay();
            $akhir = Carbon::parse($tanggalAkhir)->endOfDay();
        } elseif ($periode === 'tahun') {
            // Per tahun penuh
            $awal  = Carbon::create($tahun, 1, 1)->startOfDay();
            $akhir = Carbon::create($tahun, 12, 31)->endOfDay();
        } else {
            // Per bulan (default)
            $awal  = Carbon::create($tahun, $bulan, 1)->startOfMonth();
            $akhir = Carbon::create($tahun, $bulan, 1)->endOfMonth();
        }

        // ─── Ringkasan kas ikut difilter sesuai periode terpilih ────
        $kasMasuk = TransaksiKas::where('jenis_kas', 'masuk')
            ->whereBetween('tanggal_transaksi', [$awal, $akhir])
            ->sum('nominal');

        $kasKeluar = TransaksiKas::where('jenis_kas', 'keluar')
            ->whereBetween('tanggal_transaksi', [$awal, $akhir])
            ->sum('nominal');

        $saldoAkhir = $kasMasuk - $kasKeluar;

        $grafikArusKas = TransaksiKas::select(
                DB::raw('DATE(tanggal_transaksi) as tanggal'),
                DB::raw('SUM(CASE WHEN jenis_kas = "masuk" THEN nominal ELSE 0 END) as pemasukan'),
                DB::raw('SUM(CASE WHEN jenis_kas = "keluar" THEN nominal ELSE 0 END) as pengeluaran')
            )
            ->whereBetween('tanggal_transaksi', [$awal, $akhir])
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
            ->get();

        // ─── Ringkasan Penjualan TBS, ikut difilter sesuai periode terpilih ────
        $totalNilaiTbs = PenjualanTbs::whereBetween('tanggal_timbang', [$awal, $akhir])
            ->sum('total_nilai');

        $totalBeratTbs = PenjualanTbs::whereBetween('tanggal_timbang', [$awal, $akhir])
            ->sum('berat_bersih_kg');

        // Harga TBS yang sedang berlaku saat ini (bukan berdasarkan filter periode)
        $hargaTbsBerlaku = HargaTbs::latest('berlaku_mulai')->first();

        $grafikTbs = PenjualanTbs::select(
                DB::raw('DATE(tanggal_timbang) as tanggal'),
                DB::raw('SUM(total_nilai) as total_nilai')
            )
            ->whereBetween('tanggal_timbang', [$awal, $akhir])
            ->groupBy('tanggal')
            ->orderBy('tanggal', 'asc')
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
            'ringkasanTbs' => [
                'totalNilai'   => $totalNilaiTbs,
                'totalBeratKg' => $totalBeratTbs,
                'hargaBerlaku' => $hargaTbsBerlaku->harga_per_kg ?? null,
                'grafik'       => $grafikTbs,
            ],
            'grafikArusKas' => $grafikArusKas,
        ]);
    }
}