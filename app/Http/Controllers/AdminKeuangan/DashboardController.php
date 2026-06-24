<?php

namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKas;
use App\Models\Simpanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $periode = $request->query('periode', 'harian');

        return Inertia::render('AdminKeuangan/Dashboard', [
            // Props langsung — tampil saat halaman load
            'ringkasan'        => $this->ringkasan(),
            'transaksiTerbaru' => $this->transaksiTerbaru(),
            'periode'          => $periode,

            // Deferred prop — query grafik ditunda, halaman tampil duluan
            'grafik' => Inertia::defer(fn () => $this->grafik($periode)),
        ]);
    }

    private function ringkasan(): array
    {
        $now = now();

        $saldoKas = TransaksiKas::where('jenis_kas', 'masuk')->sum('nominal')
                  - TransaksiKas::where('jenis_kas', 'keluar')->sum('nominal');

        $kasMasukBulan = TransaksiKas::where('jenis_kas', 'masuk')
            ->whereMonth('tanggal_transaksi', $now->month)
            ->whereYear('tanggal_transaksi', $now->year)
            ->sum('nominal');

        $kasKeluarBulan = TransaksiKas::where('jenis_kas', 'keluar')
            ->whereMonth('tanggal_transaksi', $now->month)
            ->whereYear('tanggal_transaksi', $now->year)
            ->sum('nominal');

        $simpananWajib = Simpanan::where('jenis_simpanan', 'wajib')->sum('jumlah');
        $simpananPokok = Simpanan::where('jenis_simpanan', 'pokok')->sum('jumlah');
        $pengambilan   = Simpanan::where('jenis_simpanan', 'pengambilan')->sum('jumlah');

        return [
            'saldo_kas'        => (float) $saldoKas,
            'kas_masuk_bulan'  => (float) $kasMasukBulan,
            'kas_keluar_bulan' => (float) $kasKeluarBulan,
            'simpanan_wajib'   => (float) $simpananWajib,
            'simpanan_pokok'   => (float) $simpananPokok,
            'total_simpanan'   => (float) ($simpananWajib + $simpananPokok - $pengambilan),
            'label_bulan'      => $now->translatedFormat('F Y'), // "Mei 2026" jika locale=id
        ];
    }

    private function grafik(string $periode): array
    {
        $format = match ($periode) {
            'bulanan'  => '%Y-%m',
            'mingguan' => '%x-W%v',
            default    => '%Y-%m-%d',
        };

        return TransaksiKas::select(
                DB::raw("DATE_FORMAT(tanggal_transaksi, '{$format}') as label"),
                DB::raw("SUM(CASE WHEN jenis_kas = 'masuk'  THEN nominal ELSE 0 END) as pemasukan"),
                DB::raw("SUM(CASE WHEN jenis_kas = 'keluar' THEN nominal ELSE 0 END) as pengeluaran")
            )
            ->groupBy('label')
            ->orderBy('label')
            ->limit(30)
            ->get()
            ->map(fn ($r) => [
                'label'       => $r->label,
                'pemasukan'   => (float) $r->pemasukan,
                'pengeluaran' => (float) $r->pengeluaran,
            ])
            ->toArray();
    }

    private function transaksiTerbaru(): array
    {
        $kas = TransaksiKas::orderByDesc('tanggal_transaksi')->limit(10)->get()
            ->map(fn ($t) => [
                'id'                => 'kas-' . $t->id_transaksi,
                'keterangan'        => $t->keterangan,
                'sumber'            => 'Operasional',
                'tanggal_transaksi' => $t->tanggal_transaksi,
                'nominal'           => (float) $t->nominal,
                'arah'              => $t->jenis_kas === 'masuk' ? 'masuk' : 'keluar',
            ]);

        $simpanan = Simpanan::with('anggota')->orderByDesc('tanggal_transaksi')->limit(10)->get()
            ->map(fn ($s) => [
                'id'                => 'simpanan-' . $s->id_simpanan,
                'keterangan'        => 'Setoran Simpanan ' . ucfirst($s->jenis_simpanan),
                'sumber'            => $s->anggota?->nama_lengkap ?? '-',
                'tanggal_transaksi' => $s->tanggal_transaksi,
                'nominal'           => (float) $s->jumlah,
                'arah'              => $s->jenis_simpanan === 'pengambilan' ? 'keluar' : 'masuk',
            ]);

        return $kas->concat($simpanan)
            ->sortByDesc('tanggal_transaksi')
            ->take(5)
            ->values()
            ->toArray();
    }
}
