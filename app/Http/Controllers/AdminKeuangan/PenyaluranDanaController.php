<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminKeuangan\PenyaluranDanaRequest;
use App\Models\PenyaluranDana;
use App\Models\PenjualanTbs;
use App\Models\TransaksiKas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PenyaluranDanaController extends Controller
{
    public function index(Request $request)
    {
        $cari = $request->query('cari');

        $list = PenyaluranDana::with('anggota:id_anggota,nama_lengkap')
            ->when($cari, fn ($q) => $q->whereHas('anggota',
                fn ($qq) => $qq->where('nama_lengkap', 'like', "%{$cari}%")
            ))
            ->orderByDesc('tanggal_penyaluran')
            ->orderByDesc('id_penyaluran')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($d) => [
                'id_penyaluran'      => $d->id_penyaluran,
                'id_penjualan'       => $d->id_penjualan,
                'nama_anggota'       => $d->anggota?->nama_lengkap ?? '-',
                'total_penjualan'    => (float) $d->total_penjualan,
                'total_potongan'     => (float) $d->total_potongan,
                'dana_bersih'        => (float) $d->dana_bersih,
                'tanggal_penyaluran' => $d->tanggal_penyaluran->toDateString(),
                'keterangan'         => $d->keterangan,
            ]);

        // Ringkasan
        $totalDisalurkan = PenyaluranDana::sum('dana_bersih');
        $totalPotongan   = PenyaluranDana::sum('total_potongan'); // = pendapatan KUD dari TBS

        return Inertia::render('AdminKeuangan/PenyaluranDana', [
            'penyaluran' => $list,
            'ringkasan'  => [
                'total_disalurkan' => (float) $totalDisalurkan,
                'total_potongan'   => (float) $totalPotongan,
            ],
            // Penjualan TBS yang BELUM disalurkan (untuk dropdown form)
            'penjualanBelumSalur' => $this->penjualanBelumSalur(),
            'filter' => compact('cari'),
        ]);
    }

    public function store(PenyaluranDanaRequest $request)
    {
        DB::transaction(function () use ($request) {
            $data      = $request->validated();
            $penjualan = PenjualanTbs::with('anggota:id_anggota,nama_lengkap')
                ->lockForUpdate()->findOrFail($data['id_penjualan']);

            $danaBersih = $this->hitungDanaBersih($penjualan->total_nilai, $data['total_potongan']);

            $penyaluran = PenyaluranDana::create([
                'id_anggota'         => $penjualan->id_anggota,
                'id_penjualan'       => $penjualan->id_penjualan,
                'total_penjualan'    => $penjualan->total_nilai,
                'total_potongan'     => $data['total_potongan'],
                'dana_bersih'        => $danaBersih,
                'tanggal_penyaluran' => $data['tanggal_penyaluran'],
                'keterangan'         => $data['keterangan'] ?? null,
                'id_pengguna'        => auth('sikuda')->id(),
            ]);

            $this->postingKas($penyaluran, $penjualan->anggota?->nama_lengkap);
        });

        return back()->with('sukses', 'Penyaluran dana dicatat & kas keluar otomatis tercatat.');
    }

    public function update(PenyaluranDanaRequest $request, int $id)
    {
        DB::transaction(function () use ($request, $id) {
            $data       = $request->validated();
            $penyaluran = PenyaluranDana::with('anggota:id_anggota,nama_lengkap')
                ->lockForUpdate()->findOrFail($id);

            // total_penjualan tetap (terikat ke penjualan asal); hanya potongan yang bisa diubah
            $danaBersih = $this->hitungDanaBersih($penyaluran->total_penjualan, $data['total_potongan']);

            $penyaluran->update([
                'total_potongan'     => $data['total_potongan'],
                'dana_bersih'        => $danaBersih,
                'tanggal_penyaluran' => $data['tanggal_penyaluran'],
                'keterangan'         => $data['keterangan'] ?? null,
            ]);

            $this->postingKas($penyaluran->refresh(), $penyaluran->anggota?->nama_lengkap);
        });

        return back()->with('sukses', 'Penyaluran dana diperbarui & kas disesuaikan.');
    }

    public function destroy(int $id)
    {
        DB::transaction(function () use ($id) {
            $penyaluran = PenyaluranDana::lockForUpdate()->findOrFail($id);

            TransaksiKas::where('tipe_referensi', 'penyaluran_dana')
                ->where('id_referensi', $penyaluran->id_penyaluran)
                ->delete();

            $penyaluran->delete();
        });

        return back()->with('sukses', 'Penyaluran dana dihapus & kas keluar terkait dibatalkan.');
    }

    /** dana_bersih = total_penjualan - potongan; harus > 0 (alur pengecualian UC10) */
    private function hitungDanaBersih(float $totalPenjualan, float $potongan): float
    {
        $bersih = round($totalPenjualan - $potongan, 2);
        if ($bersih <= 0) {
            throw ValidationException::withMessages([
                'total_potongan' => 'Potongan terlalu besar — dana bersih menjadi nol atau negatif.',
            ]);
        }
        return $bersih;
    }

    /** Satu penyaluran = satu baris kas KELUAR (updateOrCreate agar edit tidak dobel) */
/** Satu penyaluran = satu baris kas KELUAR (updateOrCreate agar edit tidak dobel) */
    private function postingKas(PenyaluranDana $penyaluran, ?string $namaAnggota): void
    {
        $potonganFmt = number_format($penyaluran->total_potongan, 0, ',', '.');

        TransaksiKas::updateOrCreate(
            ['tipe_referensi' => 'penyaluran_dana', 'id_referensi' => $penyaluran->id_penyaluran],
            [
                'jenis_kas'         => 'keluar',
                'nominal'           => $penyaluran->dana_bersih,
                'keterangan'        => 'Penyaluran dana TBS — ' . ($namaAnggota ?? 'Anggota')
                                      . ' (potongan biaya kebun Rp ' . $potonganFmt . ')',
                'tanggal_transaksi' => $penyaluran->tanggal_penyaluran,
                'id_pengguna'       => auth('sikuda')->id(),
            ]
        );
    }

    /** Penjualan TBS yang belum punya penyaluran */
    private function penjualanBelumSalur()
    {
        return PenjualanTbs::with('anggota:id_anggota,nama_lengkap')
            ->whereDoesntHave('penyaluranDana')
            ->orderByDesc('tanggal_timbang')
            ->get()
            ->map(fn ($p) => [
                'id_penjualan'    => $p->id_penjualan,
                'nama_anggota'    => $p->anggota?->nama_lengkap ?? '-',
                'berat_bersih_kg' => (float) $p->berat_bersih_kg,
                'total_nilai'     => (float) $p->total_nilai,
                'tanggal_timbang' => $p->tanggal_timbang->toDateString(),
            ]);
    }
}
