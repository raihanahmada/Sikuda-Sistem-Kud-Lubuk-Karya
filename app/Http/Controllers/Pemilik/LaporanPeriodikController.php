<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKas;
use App\Models\PenjualanTbs;
use App\Models\PembelianBarang;
use App\Models\Simpanan;
use App\Models\PenyaluranDana;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class LaporanPeriodikController extends Controller
{
    public function index(Request $request)
    {
        $tahunSekarang = Carbon::now()->year;

        // ── Tentukan mode periode: 'tahun', 'bulan', atau 'rentang' ──────
        $modePeriode = $request->input('mode', 'tahun'); // default: tahun

        // ── Hitung start & end berdasarkan mode ─────────────────────────
        if ($modePeriode === 'rentang') {
            // Rentang tanggal kustom dari popup kalender
            $start = $request->input('tanggal_mulai');
            $end   = $request->input('tanggal_akhir');
            $tahun = Carbon::parse($start)->year;
            $bulan = null;
            $labelPeriode = Carbon::parse($start)->translatedFormat('d M Y')
                . ' s.d. ' . Carbon::parse($end)->translatedFormat('d M Y');
        } elseif ($modePeriode === 'bulan') {
            $tahun = (int) $request->input('tahun', $tahunSekarang);
            $bulan = (int) $request->input('bulan', Carbon::now()->month);
            $start = Carbon::create($tahun, $bulan, 1)->startOfMonth()->toDateString();
            $end   = Carbon::create($tahun, $bulan, 1)->endOfMonth()->toDateString();
            $labelPeriode = Carbon::create($tahun, $bulan, 1)->translatedFormat('F Y');
        } else {
            // default: per tahun (juga fallback kalau mode tidak dikenali)
            $modePeriode = 'tahun';
            $tahun = (int) $request->input('tahun', $tahunSekarang);
            $bulan = null;
            $start = Carbon::create($tahun, 1, 1)->toDateString();
            $end   = Carbon::create($tahun, 12, 31)->toDateString();
            $labelPeriode = "Tahun $tahun";
        }

        // ── Ambil daftar tahun yang tersedia dari semua model ────────────
        $tahunTersedia = $this->getTahunTersedia($tahunSekarang);

        // ── 1. Kumpulkan semua transaksi dari semua model ────────────────

        // TransaksiKas
        $kas = TransaksiKas::whereBetween('tanggal_transaksi', [$start, $end])
            ->get()
            ->map(fn($d) => [
                'tanggal'   => Carbon::parse($d->tanggal_transaksi)->format('Y-m-d'),
                'jenis'     => 'Transaksi Kas',
                'deskripsi' => $d->keterangan ?? '-',
                'jumlah'    => (float) $d->nominal,
                'unit'      => 'Kas Koperasi',
                'tipe'      => $d->jenis_kas === 'masuk' ? 'masuk' : 'keluar',
            ]);

        // PenjualanTbs
        $tbs = PenjualanTbs::with('anggota')
            ->whereBetween('tanggal_timbang', [$start, $end])
            ->get()
            ->map(fn($d) => [
                'tanggal'   => Carbon::parse($d->tanggal_timbang)->format('Y-m-d'),
                'jenis'     => 'Penjualan TBS',
                'deskripsi' => 'TBS - ' . ($d->anggota->nama_lengkap ?? '-'),
                'jumlah'    => (float) $d->total_nilai,
                'unit'      => 'Unit RAM (TBS)',
                'tipe'      => 'masuk',
            ]);

        // PembelianBarang
        $barang = PembelianBarang::with(['anggota', 'barang'])
            ->whereBetween('tanggal_pembelian', [$start, $end])
            ->get()
            ->map(fn($d) => [
                'tanggal'   => Carbon::parse($d->tanggal_pembelian)->format('Y-m-d'),
                'jenis'     => 'Pembelian Barang',
                'deskripsi' => ($d->barang->nama_barang ?? '-') . ' - ' . ($d->anggota->nama_lengkap ?? '-'),
                'jumlah'    => (float) $d->total_harga,
                'unit'      => 'Unit Saprodi',
                'tipe'      => 'keluar',
            ]);

        // Simpanan
        $simpanan = Simpanan::with('anggota')
            ->whereBetween('tanggal_transaksi', [$start, $end])
            ->get()
            ->map(fn($d) => [
                'tanggal'   => Carbon::parse($d->tanggal_transaksi)->format('Y-m-d'),
                'jenis'     => 'Simpanan',
                'deskripsi' => ucfirst($d->jenis_simpanan) . ' - ' . ($d->anggota->nama_lengkap ?? '-'),
                'jumlah'    => (float) $d->jumlah,
                'unit'      => 'Simpan Pinjam',
                'tipe'      => 'masuk',
            ]);

        // PenyaluranDana
        $penyaluran = PenyaluranDana::with('anggota')
            ->whereBetween('tanggal_penyaluran', [$start, $end])
            ->get()
            ->map(fn($d) => [
                'tanggal'   => Carbon::parse($d->tanggal_penyaluran)->format('Y-m-d'),
                'jenis'     => 'Penyaluran Dana',
                'deskripsi' => 'Penyaluran - ' . ($d->anggota->nama_lengkap ?? '-'),
                'jumlah'    => (float) $d->dana_bersih,
                'unit'      => 'Unit RAM (TBS)',
                'tipe'      => 'keluar',
            ]);

        // ── 2. Gabungkan & urutkan ───────────────────────────────────────
        $semuaTransaksi = collect()
            ->merge($kas)
            ->merge($tbs)
            ->merge($barang)
            ->merge($simpanan)
            ->merge($penyaluran)
            ->sortBy('tanggal')
            ->values();

        // ── 3. Hitung summary ────────────────────────────────────────────
        $totalMasuk  = $semuaTransaksi->where('tipe', 'masuk')->sum('jumlah');
        $totalKeluar = $semuaTransaksi->where('tipe', 'keluar')->sum('jumlah');
        $labaBersih  = $totalMasuk - $totalKeluar;

        return Inertia::render('Pemilik/LaporanPeriodik', [
            'transaksi'     => $semuaTransaksi,
            'summary'       => [
                'totalMasuk'  => $totalMasuk,
                'totalKeluar' => $totalKeluar,
                'labaBersih'  => $labaBersih,
            ],
            'filterAktif'   => [
                'mode'         => $modePeriode,
                'tahun'        => $tahun,
                'bulan'        => $bulan,
                'start'        => $start,
                'end'          => $end,
                'labelPeriode' => $labelPeriode,
            ],
            'tahunTersedia' => $tahunTersedia,
        ]);
    }

    // ── Helper: kumpulkan daftar tahun dari semua tabel ──────────────────────
    private function getTahunTersedia(int $tahunSekarang): array
    {
        $columns = [
            [TransaksiKas::class,    'tanggal_transaksi'],
            [PenjualanTbs::class,    'tanggal_timbang'],
            [PembelianBarang::class, 'tanggal_pembelian'],
            [Simpanan::class,        'tanggal_transaksi'],
            [PenyaluranDana::class,  'tanggal_penyaluran'],
        ];

        $tahunMin = $tahunSekarang;

        foreach ($columns as [$model, $col]) {
            $min = $model::selectRaw("MIN(YEAR($col)) as min_year")->value('min_year');
            if ($min && (int) $min < $tahunMin) {
                $tahunMin = (int) $min;
            }
        }

        $tahunTersedia = [];
        for ($y = $tahunSekarang; $y >= $tahunMin; $y--) {
            $tahunTersedia[] = $y;
        }

        return $tahunTersedia;
    }
}