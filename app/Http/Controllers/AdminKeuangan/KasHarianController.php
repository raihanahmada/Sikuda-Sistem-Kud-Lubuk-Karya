<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminKeuangan\KasHarianRequest;
use App\Models\TransaksiKas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KasHarianController extends Controller
{
    public function index(Request $request)
    {
        $jenis  = $request->query('jenis', 'semua'); // semua | masuk | keluar
        $dari   = $request->query('dari');
        $sampai = $request->query('sampai');
        $cari   = $request->query('cari');

        $list = TransaksiKas::query()
            ->when($jenis !== 'semua', fn ($q) => $q->where('jenis_kas', $jenis))
            ->when($dari,   fn ($q) => $q->whereDate('tanggal_transaksi', '>=', $dari))
            ->when($sampai, fn ($q) => $q->whereDate('tanggal_transaksi', '<=', $sampai))
            ->when($cari,   fn ($q) => $q->where('keterangan', 'like', "%{$cari}%"))
            ->orderByDesc('tanggal_transaksi')
            ->orderByDesc('id_transaksi')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($t) => [
                'id_transaksi'      => $t->id_transaksi,
                'jenis_kas'         => $t->jenis_kas,
                'nominal'           => (float) $t->nominal,
                'keterangan'        => $t->keterangan,
                'tanggal_transaksi' => $t->tanggal_transaksi->toDateString(),
            ]);

        // Ringkasan mengikuti rentang tanggal (abaikan filter jenis agar 2 kartu tetap terisi)
        $base = TransaksiKas::query()
            ->when($dari,   fn ($q) => $q->whereDate('tanggal_transaksi', '>=', $dari))
            ->when($sampai, fn ($q) => $q->whereDate('tanggal_transaksi', '<=', $sampai));

        $totalMasuk  = (clone $base)->where('jenis_kas', 'masuk')->sum('nominal');
        $totalKeluar = (clone $base)->where('jenis_kas', 'keluar')->sum('nominal');

        return Inertia::render('AdminKeuangan/KasHarian', [
            'transaksi' => $list,
            'ringkasan' => [
                'total_masuk'  => (float) $totalMasuk,
                'total_keluar' => (float) $totalKeluar,
                'saldo'        => (float) ($totalMasuk - $totalKeluar),
            ],
            'filter' => compact('jenis', 'dari', 'sampai', 'cari'),
        ]);
    }

    public function store(KasHarianRequest $request)
    {
        TransaksiKas::create([
            ...$request->validated(),
            'id_pengguna' => auth('sikuda')->id(),
        ]);

        return back()->with('sukses', 'Transaksi kas berhasil ditambahkan.');
    }

    public function update(KasHarianRequest $request, int $id)
    {
        $transaksi = TransaksiKas::findOrFail($id);
        $transaksi->update($request->validated());

        return back()->with('sukses', 'Transaksi kas berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        TransaksiKas::findOrFail($id)->delete();

        return back()->with('sukses', 'Transaksi kas berhasil dihapus.');
    }
}
