<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Simpanan;
use App\Models\Anggota;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SimpananController extends Controller
{
    public function index(Request $request)
    {
        $start       = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
        $end         = $request->input('end',   Carbon::now()->endOfMonth()->toDateString());
        $jenisFilter = $request->input('jenis');         // pokok | wajib | pengambilan | Semua | null
        $cariRiwayat = $request->input('cari_riwayat');  // search di tab Riwayat
        $cariAnggota = $request->input('cari_anggota');  // search di tab Per Anggota

        // ── 1. Breakdown per jenis simpanan (SEKARANG ikut difilter sesuai rentang tanggal) ──
        // Catatan: ini tetap SUM(jumlah) polos per jenis (bukan net),
        // karena tiap kartu ("Simpanan Pokok", "Simpanan Wajib",
        // "Simpanan Pengambilan") memang menampilkan total per jenis
        // masing-masing, bukan saldo gabungan.
        $breakdownJenis = Simpanan::select('jenis_simpanan', DB::raw('SUM(jumlah) as total'), DB::raw('COUNT(*) as jumlah_transaksi'))
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->groupBy('jenis_simpanan')
            ->get()
            ->map(fn($d) => [
                'jenis'            => $d->jenis_simpanan,
                'total'            => $d->total,
                'jumlah_transaksi' => $d->jumlah_transaksi,
            ]);

        // ── Total Dana Simpanan (net: pokok + wajib - pengambilan), SEKARANG ikut difilter ──
        // Pengambilan adalah dana KELUAR, jadi harus dikurangkan,
        // bukan dijumlahkan seperti SUM('jumlah') sebelumnya.
        $totalSimpanan = Simpanan::whereBetween('tanggal_transaksi', [$start, $end])
            ->selectRaw("
                SUM(CASE WHEN jenis_simpanan = 'pengambilan' THEN -jumlah ELSE jumlah END) as total
            ")->value('total') ?? 0;

        // ── 2. Per anggota (all-time, difilter search nama) ─────────────
        $perAnggotaQuery = Anggota::select('tb_anggota.id_anggota', 'tb_anggota.nama_lengkap')
            ->leftJoin('tb_simpanan', 'tb_anggota.id_anggota', '=', 'tb_simpanan.id_anggota')
            ->selectRaw("
                SUM(CASE WHEN jenis_simpanan = 'pokok' THEN jumlah ELSE 0 END) as pokok,
                SUM(CASE WHEN jenis_simpanan = 'wajib' THEN jumlah ELSE 0 END) as wajib,
                SUM(CASE WHEN jenis_simpanan = 'pengambilan' THEN jumlah ELSE 0 END) as pengambilan,
                SUM(CASE WHEN jenis_simpanan = 'pengambilan' THEN -jumlah ELSE jumlah END) as total
            ");

        if ($cariAnggota) {
            $perAnggotaQuery->where('tb_anggota.nama_lengkap', 'like', "%{$cariAnggota}%");
        }

        $perAnggota = $perAnggotaQuery
            ->groupBy('tb_anggota.id_anggota', 'tb_anggota.nama_lengkap')
            ->orderByDesc('total')
            ->get();

        // ── 3. Riwayat transaksi (filter tanggal + jenis + search) ──────
        $riwayatQuery = Simpanan::with('anggota')
            ->whereBetween('tanggal_transaksi', [$start, $end]);

        if ($jenisFilter && $jenisFilter !== 'Semua') {
            $riwayatQuery->where('jenis_simpanan', $jenisFilter);
        }

        if ($cariRiwayat) {
            $riwayatQuery->where(function ($q) use ($cariRiwayat) {
                $q->where('keterangan', 'like', "%{$cariRiwayat}%")
                  ->orWhereHas('anggota', function ($q2) use ($cariRiwayat) {
                      $q2->where('nama_lengkap', 'like', "%{$cariRiwayat}%");
                  });
            });
        }

        $riwayat = $riwayatQuery
            ->orderByDesc('tanggal_transaksi')
            ->get()
            ->map(fn($d) => [
                'tanggal'    => $d->tanggal_transaksi->format('Y-m-d'),
                'jenis'      => $d->jenis_simpanan,
                'anggota'    => $d->anggota->nama_lengkap ?? '-',
                'jumlah'     => $d->jumlah,
                'keterangan' => $d->keterangan ?? '-',
            ]);

        return Inertia::render('Pemilik/Simpanan', [
            'totalSimpanan'  => $totalSimpanan,
            'breakdownJenis' => $breakdownJenis,
            'perAnggota'     => $perAnggota,
            'riwayat'        => $riwayat,
            'filterAktif'    => [
                'start'        => $start,
                'end'          => $end,
                'jenis'        => $jenisFilter ?? 'Semua',
                'cari_riwayat' => $cariRiwayat ?? '',
                'cari_anggota' => $cariAnggota ?? '',
            ],
        ]);
    }
}