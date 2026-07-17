<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\PenjualanTbs;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TrackingController extends Controller
{
    public function index(Request $request)
    {
        // ===== PENERAPAN MATERI: useEffect Search Server-Side (Pertemuan 11) =====
        // Filter nama anggota di level query sebelum map()
        $query = Anggota::where('status_keanggotaan', 'aktif');

        if ($request->filled('search')) {
            $query->where('nama_lengkap', 'like', "%{$request->search}%");
        }
        // ===== AKHIR PENERAPAN =====

        // ===== PENERAPAN MATERI: Pagination Server-Side (pola sama seperti Admin Keuangan, 10 data/halaman) =====
        $dataTracking = $query->orderBy('nama_lengkap')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($a) {
                $totalTbs = PenjualanTbs::where('id_anggota', $a->id_anggota)->sum('berat_bersih_kg');
                $terakhirTransaksi = PenjualanTbs::where('id_anggota', $a->id_anggota)
                    ->latest('tanggal_timbang')
                    ->first();

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
                    'status_keanggotaan' => $a->status_keanggotaan,
                    'penjualan_count' => PenjualanTbs::where('id_anggota', $a->id_anggota)->count(),
                    'total_tbs' => $totalTbs,
                    'terakhir_aktif' => $terakhirTransaksi ? $terakhirTransaksi->tanggal_timbang : 'Belum ada',
                    'status_evaluasi' => $statusEvaluasi
                ];
            });
        // ===== AKHIR PENERAPAN =====

        return Inertia::render('AdminAnggota/Tracking/Index', [
            'dataTracking' => $dataTracking,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show($id)
    {
        $anggota = Anggota::withCount(['penjualanTbs as penjualan_count'])->findOrFail($id);
        return Inertia::render('AdminAnggota/Tracking/Show', ['anggota' => $anggota]);
    }
}