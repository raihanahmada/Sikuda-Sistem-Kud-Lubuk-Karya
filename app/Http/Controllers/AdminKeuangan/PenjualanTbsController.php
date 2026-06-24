<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminKeuangan\PenjualanTbsRequest;
use App\Models\PenjualanTbs;
use App\Models\TransaksiKas;
use App\Models\HargaTbs;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PenjualanTbsController extends Controller
{
    public function index(Request $request)
    {
        $cari = $request->query('cari');

        $list = PenjualanTbs::with('anggota:id_anggota,nama_lengkap')
            ->when($cari, fn ($q) => $q->whereHas('anggota',
                fn ($qq) => $qq->where('nama_lengkap', 'like', "%{$cari}%")
            ))
            ->orderByDesc('tanggal_timbang')
            ->orderByDesc('id_penjualan')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($p) => [
                'id_penjualan'    => $p->id_penjualan,
                'nama_anggota'    => $p->anggota?->nama_lengkap ?? '-',
                'id_anggota'      => $p->id_anggota,
                'berat_bersih_kg' => (float) $p->berat_bersih_kg,
                'harga_per_kg'    => (float) $p->harga_per_kg,
                'total_nilai'     => (float) $p->total_nilai,
                'tanggal_timbang' => $p->tanggal_timbang->toDateString(),
            ]);

        $harga = HargaTbs::berlaku();

        return Inertia::render('AdminKeuangan/PenjualanTbs', [
            'penjualan' => $list,
            'hargaBerlaku' => $harga ? [
                'harga_per_kg'  => (float) $harga->harga_per_kg,
                'berlaku_mulai' => $harga->berlaku_mulai->toDateString(),
            ] : null,
            'daftarAnggota' => Anggota::where('status_keanggotaan', 'aktif')
                ->orderBy('nama_lengkap')
                ->get(['id_anggota', 'nama_lengkap']),
            'filter' => compact('cari'),
        ]);
    }

    public function store(PenjualanTbsRequest $request)
    {
        DB::transaction(function () use ($request) {
            $data  = $request->validated();
            $harga = $this->hargaBerlakuAtauGagal();

            $total = round($data['berat_bersih_kg'] * $harga, 2);

            // 1. Catat penjualan (snapshot harga saat ini)
            $penjualan = PenjualanTbs::create([
                'id_anggota'      => $data['id_anggota'],
                'berat_bersih_kg' => $data['berat_bersih_kg'],
                'harga_per_kg'    => $harga,
                'total_nilai'     => $total,
                'tanggal_timbang' => $data['tanggal_timbang'],
                'id_pengguna'     => auth('sikuda')->id(),
            ]);

            // 2. Tafsir A — auto-posting KAS MASUK terkait penjualan ini
            $this->postingKas($penjualan);
        });

        return back()->with('sukses', 'Penjualan TBS dicatat & kas masuk otomatis tercatat.');
    }

    public function update(PenjualanTbsRequest $request, int $id)
    {
        DB::transaction(function () use ($request, $id) {
            $data      = $request->validated();
            $penjualan = PenjualanTbs::lockForUpdate()->findOrFail($id);

            // Edit hanya menyesuaikan berat/anggota/tanggal; harga tetap snapshot semula
            $penjualan->update([
                'id_anggota'      => $data['id_anggota'],
                'berat_bersih_kg' => $data['berat_bersih_kg'],
                'total_nilai'     => round($data['berat_bersih_kg'] * $penjualan->harga_per_kg, 2),
                'tanggal_timbang' => $data['tanggal_timbang'],
            ]);

            // Sinkronkan baris kas terkait
            $this->postingKas($penjualan->refresh());
        });

        return back()->with('sukses', 'Penjualan TBS diperbarui & kas disesuaikan.');
    }

    public function destroy(int $id)
    {
        DB::transaction(function () use ($id) {
            $penjualan = PenjualanTbs::lockForUpdate()->findOrFail($id);

            // Hapus baris kas terkait dulu, baru penjualannya
            TransaksiKas::where('tipe_referensi', 'penjualan_tbs')
                ->where('id_referensi', $penjualan->id_penjualan)
                ->delete();

            $penjualan->delete();
        });

        return back()->with('sukses', 'Penjualan TBS dihapus & kas masuk terkait dibatalkan.');
    }

    /** Buat/perbarui satu baris kas MASUK yang terikat ke penjualan ini */
    private function postingKas(PenjualanTbs $penjualan): void
    {
        $nama = $penjualan->anggota?->nama_lengkap ?? 'Anggota';
        $atribut = [
            'jenis_kas'         => 'masuk',
            'nominal'           => $penjualan->total_nilai,
            'keterangan'        => "Penjualan TBS — {$nama} ({$penjualan->berat_bersih_kg} kg)",
            'tanggal_transaksi' => $penjualan->tanggal_timbang,
            'id_pengguna'       => auth('sikuda')->id(),
        ];

        TransaksiKas::updateOrCreate(
            ['tipe_referensi' => 'penjualan_tbs', 'id_referensi' => $penjualan->id_penjualan],
            $atribut
        );
    }

    private function hargaBerlakuAtauGagal(): float
    {
        $harga = HargaTbs::berlaku();
        if (!$harga) {
            throw ValidationException::withMessages([
                'berat_bersih_kg' => 'Harga TBS belum diatur. Set harga TBS terlebih dahulu.',
            ]);
        }
        return (float) $harga->harga_per_kg;
    }
}
