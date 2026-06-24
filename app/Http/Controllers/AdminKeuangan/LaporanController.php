<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Models\TransaksiKas;
use App\Models\Simpanan;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $periode = $request->query('periode', 'bulanan'); // mingguan|15harian|bulanan|tahunan
        $tanggal = $request->query('tanggal', now()->toDateString());
        $ref = Carbon::parse($tanggal);

        [$mulai, $selesai, $label] = $this->rentang($periode, $ref);

        // Mutasi kas dalam periode
        $masuk  = (float) TransaksiKas::where('jenis_kas', 'masuk')
            ->whereBetween('tanggal_transaksi', [$mulai, $selesai])->sum('nominal');
        $keluar = (float) TransaksiKas::where('jenis_kas', 'keluar')
            ->whereBetween('tanggal_transaksi', [$mulai, $selesai])->sum('nominal');

        // Saldo awal = seluruh mutasi SEBELUM periode (untuk tutup buku)
        $masukSblm  = (float) TransaksiKas::where('jenis_kas', 'masuk')
            ->where('tanggal_transaksi', '<', $mulai)->sum('nominal');
        $keluarSblm = (float) TransaksiKas::where('jenis_kas', 'keluar')
            ->where('tanggal_transaksi', '<', $mulai)->sum('nominal');
        $saldoAwal = $masukSblm - $keluarSblm;

        // Rincian transaksi periode
        $rincian = TransaksiKas::whereBetween('tanggal_transaksi', [$mulai, $selesai])
            ->orderBy('tanggal_transaksi')->orderBy('id_transaksi')
            ->get()
            ->map(fn ($t) => [
                'tanggal'    => $t->tanggal_transaksi->toDateString(),
                'jenis_kas'  => $t->jenis_kas,
                'keterangan' => $t->keterangan,
                'nominal'    => (float) $t->nominal,
            ]);

        // Posisi simpanan s/d akhir periode (hanya relevan untuk bulanan & tahunan)
        $posisiSimpanan = null;
        if (in_array($periode, ['bulanan', 'tahunan'])) {
            $pokok       = (float) Simpanan::where('jenis_simpanan', 'pokok')
                ->where('tanggal_transaksi', '<=', $selesai)->sum('jumlah');
            $wajib       = (float) Simpanan::where('jenis_simpanan', 'wajib')
                ->where('tanggal_transaksi', '<=', $selesai)->sum('jumlah');
            $pengambilan = (float) Simpanan::where('jenis_simpanan', 'pengambilan')
                ->where('tanggal_transaksi', '<=', $selesai)->sum('jumlah');

            $posisiSimpanan = [
                'pokok'       => $pokok,
                'wajib'       => $wajib,
                'pengambilan' => $pengambilan,
                'saldo'       => $pokok + $wajib - $pengambilan,
            ];
        }

        return Inertia::render('AdminKeuangan/Laporan', [
            'periode' => $periode,
            'tanggal' => $tanggal,
            'meta'    => [
                'label'        => $label,
                'mulai'        => $mulai->toDateString(),
                'selesai'      => $selesai->toDateString(),
                'dicetak_pada' => now()->translatedFormat('d F Y H:i'),
            ],
            'ringkasan' => [
                'saldo_awal'  => $saldoAwal,
                'total_masuk' => $masuk,
                'total_keluar'=> $keluar,
                'saldo_akhir' => $saldoAwal + $masuk - $keluar,
            ],
            'rincian'        => $rincian,
            'posisiSimpanan' => $posisiSimpanan,
            'isTutupBuku'    => $periode === 'tahunan',
        ]);
    }

    /** Hitung [mulai, selesai, label] berdasarkan jenis periode & tanggal acuan */
    private function rentang(string $periode, Carbon $ref): array
    {
        return match ($periode) {
            'mingguan' => [
                $ref->copy()->startOfWeek(),
                $ref->copy()->endOfWeek(),
                'Minggu ' . $ref->copy()->startOfWeek()->translatedFormat('d M')
                    . ' – ' . $ref->copy()->endOfWeek()->translatedFormat('d M Y'),
            ],
            '15harian' => $ref->day <= 15
                ? [$ref->copy()->startOfMonth(), $ref->copy()->startOfMonth()->addDays(14),
                   '1–15 ' . $ref->translatedFormat('F Y')]
                : [$ref->copy()->startOfMonth()->addDays(15), $ref->copy()->endOfMonth(),
                   '16–' . $ref->copy()->endOfMonth()->day . ' ' . $ref->translatedFormat('F Y')],
            'tahunan' => [
                $ref->copy()->startOfYear(),
                $ref->copy()->endOfYear(),
                'Tahun ' . $ref->year . ' (Tutup Buku)',
            ],
            default => [ // bulanan
                $ref->copy()->startOfMonth(),
                $ref->copy()->endOfMonth(),
                $ref->translatedFormat('F Y'),
            ],
        };
    }
}
