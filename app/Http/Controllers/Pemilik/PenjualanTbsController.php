<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PenjualanTbs;
use App\Models\HargaTbs;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PenjualanTbsController extends Controller
{
    public function index(Request $request)
    {
        // ─── Tentukan rentang tanggal berdasarkan parameter periode ───────────
        // Default: bulan & tahun saat ini (kalau tidak ada parameter dikirim)
        $tahun        = (int) $request->input('tahun', now()->year);
        $bulan        = (int) $request->input('bulan', now()->month);
        $tanggalMulai = $request->input('start');
        $tanggalAkhir = $request->input('end');
        $cari         = $request->input('cari');

        if ($tanggalMulai && $tanggalAkhir) {
            $awal  = Carbon::parse($tanggalMulai)->startOfDay();
            $akhir = Carbon::parse($tanggalAkhir)->endOfDay();
        } else {
            // Default: bulan berjalan
            $awal  = Carbon::create($tahun, $bulan, 1)->startOfMonth();
            $akhir = Carbon::create($tahun, $bulan, 1)->endOfMonth();
        }

        // ─── Query transaksi penjualan TBS, ikut filter periode & pencarian ───
        $query = PenjualanTbs::with('anggota')
            ->whereBetween('tanggal_timbang', [$awal, $akhir]);

        if ($cari) {
            $query->whereHas('anggota', function ($q) use ($cari) {
                $q->where('nama_lengkap', 'like', "%{$cari}%");
            });
        }

        $transaksi = $query->orderBy('tanggal_timbang', 'desc')
            ->get()
            ->map(function ($t) {
                return [
                    'id_penjualan'     => $t->id_penjualan,
                    'tanggal_timbang'  => $t->tanggal_timbang,
                    'nama_anggota'     => $t->anggota->nama_lengkap ?? '-',
                    'berat_bersih_kg'  => $t->berat_bersih_kg,
                    'harga_per_kg'     => $t->harga_per_kg,
                    'total_nilai'      => $t->total_nilai,
                ];
            });

        // ─── Ringkasan sesuai periode & pencarian yang sama ────────────────────
        $totalNilai   = $transaksi->sum('total_nilai');
        $totalBeratKg = $transaksi->sum('berat_bersih_kg');

        // Harga TBS yang sedang berlaku saat ini (independen dari filter periode)
        $hargaTbsBerlaku = HargaTbs::latest('berlaku_mulai')->first();

        return Inertia::render('Pemilik/PenjualanTbs', [
            'ringkasanTbs' => [
                'totalNilai'   => $totalNilai,
                'totalBeratKg' => $totalBeratKg,
                'hargaBerlaku' => $hargaTbsBerlaku->harga_per_kg ?? null,
            ],
            'transaksi'    => $transaksi,
            'filterAktif'  => [
                'cari'  => $cari,
                'start' => $awal->toDateString(),
                'end'   => $akhir->toDateString(),
            ],
        ]);
    }
}