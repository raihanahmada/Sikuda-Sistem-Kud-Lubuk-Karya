<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKas;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class KasController extends Controller
{
    // Label tampilan untuk tiap sumber transaksi (dari kolom tipe_referensi)
    private const LABEL_SUMBER = [
        'penjualan_tbs'   => 'Penjualan TBS',
        'penyaluran_dana' => 'Penyaluran Dana',
        'manual'          => 'Manual / Operasional',
    ];

    public function index(Request $request)
    {
        $start       = $request->input('start', Carbon::now()->startOfYear()->toDateString());
        $end         = $request->input('end',   Carbon::now()->endOfYear()->toDateString());
        $jenisFilter = $request->input('jenis');        // masuk | keluar | Semua | null
        $cariRiwayat = $request->input('cari_riwayat'); // search di tab Riwayat (keterangan)
        $cariSumber  = $request->input('cari_sumber');  // search di tab Per Sumber (nama sumber)

        // ── 1. Ringkasan saldo — ikut difilter sesuai rentang tanggal ──
        $totalMasuk = TransaksiKas::where('jenis_kas', 'masuk')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->sum('nominal');

        $totalKeluar = TransaksiKas::where('jenis_kas', 'keluar')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->sum('nominal');

        $saldoAkhir = $totalMasuk - $totalKeluar;

        $totalTransaksi = TransaksiKas::whereBetween('tanggal_transaksi', [$start, $end])->count();

        // ── 1b. Total simpanan pokok & wajib — ikut difilter sesuai rentang tanggal ──
        // Pakai query builder langsung ke tabel, tanpa import model Simpanan.
        // Ambil count + sum sekaligus biar bisa dipakai ulang di breakdown bawah.
        $simpananPokokRow = DB::table('tb_simpanan')
            ->where('jenis_simpanan', 'pokok')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->selectRaw('COUNT(*) as jumlah_transaksi, SUM(jumlah) as total')->first();
        $simpananWajibRow = DB::table('tb_simpanan')
            ->where('jenis_simpanan', 'wajib')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->selectRaw('COUNT(*) as jumlah_transaksi, SUM(jumlah) as total')->first();

        $totalSimpananPokok = $simpananPokokRow->total ?? 0;
        $totalSimpananWajib = $simpananWajibRow->total ?? 0;

        // ── 2. Per Sumber — ikut difilter sesuai rentang tanggal ──
        // tipe_referensi null = transaksi manual/operasional (input langsung,
        // bukan hasil auto-posting dari penjualan TBS / penyaluran dana)
        $perSumberRaw = TransaksiKas::whereBetween('tanggal_transaksi', [$start, $end])
            ->selectRaw("
                COALESCE(tipe_referensi, 'manual') as sumber,
                SUM(CASE WHEN jenis_kas = 'masuk'  THEN nominal ELSE 0 END) as kas_masuk,
                SUM(CASE WHEN jenis_kas = 'keluar' THEN nominal ELSE 0 END) as kas_keluar,
                SUM(CASE WHEN jenis_kas = 'masuk' THEN nominal ELSE -nominal END) as net,
                COUNT(*) as jumlah_transaksi
            ")
            ->groupBy('sumber')
            ->get()
            ->map(fn($d) => [
                'sumber_key'       => $d->sumber,
                'sumber'           => self::LABEL_SUMBER[$d->sumber] ?? ucfirst($d->sumber),
                'kas_masuk'        => $d->kas_masuk,
                'kas_keluar'       => $d->kas_keluar,
                'net'              => $d->net,
                'jumlah_transaksi' => $d->jumlah_transaksi,
            ]);

        // Tambahin 2 baris simpanan (pokok & wajib) ke breakdown yang sama,
        // disetarakan sebagai "kas masuk" karena keduanya dana masuk ke koperasi.
        $perSumberRaw->push([
            'sumber_key'       => 'simpanan_pokok',
            'sumber'           => 'Simpanan Pokok',
            'kas_masuk'        => $totalSimpananPokok,
            'kas_keluar'       => 0,
            'net'              => $totalSimpananPokok,
            'jumlah_transaksi' => $simpananPokokRow->jumlah_transaksi ?? 0,
        ]);
        $perSumberRaw->push([
            'sumber_key'       => 'simpanan_wajib',
            'sumber'           => 'Simpanan Wajib',
            'kas_masuk'        => $totalSimpananWajib,
            'kas_keluar'       => 0,
            'net'              => $totalSimpananWajib,
            'jumlah_transaksi' => $simpananWajibRow->jumlah_transaksi ?? 0,
        ]);

        $perSumber = $cariSumber
            ? $perSumberRaw->filter(fn($s) => stripos($s['sumber'], $cariSumber) !== false)->values()
            : $perSumberRaw->values();

        // ── 3. Riwayat transaksi (filter tanggal + jenis + search) ───────
        $riwayatQuery = TransaksiKas::with('pengguna')
            ->whereBetween('tanggal_transaksi', [$start, $end]);

        if ($jenisFilter && $jenisFilter !== 'Semua') {
            $riwayatQuery->where('jenis_kas', $jenisFilter);
        }

        if ($cariRiwayat) {
            $riwayatQuery->where('keterangan', 'like', "%{$cariRiwayat}%");
        }

        $riwayat = $riwayatQuery
            ->orderByDesc('tanggal_transaksi')
            ->get()
            ->map(fn($d) => [
                'tanggal'    => $d->tanggal_transaksi->format('Y-m-d'),
                'jenis'      => $d->jenis_kas,
                'sumber'     => self::LABEL_SUMBER[$d->tipe_referensi ?? 'manual'] ?? ucfirst($d->tipe_referensi),
                'jumlah'     => $d->nominal,
                'keterangan' => $d->keterangan ?? '-',
                'oleh'       => $d->pengguna->nama_pengguna ?? '-',
            ]);

        return Inertia::render('Pemilik/Kas', [
            'ringkasanKas' => [
                'saldoAkhir'     => $saldoAkhir,
                'totalMasuk'     => $totalMasuk,
                'totalKeluar'    => $totalKeluar,
                'totalTransaksi' => $totalTransaksi,
            ],
            'totalSimpananPokok' => $totalSimpananPokok,
            'totalSimpananWajib' => $totalSimpananWajib,
            'perSumber'  => $perSumber,
            'riwayat'    => $riwayat,
            'filterAktif' => [
                'start'        => $start,
                'end'          => $end,
                'jenis'        => $jenisFilter ?? 'Semua',
                'cari_riwayat' => $cariRiwayat ?? '',
                'cari_sumber'  => $cariSumber ?? '',
            ],
        ]);
    }
}