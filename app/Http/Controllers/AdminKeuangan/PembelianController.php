<?php
namespace App\Http\Controllers\AdminKeuangan;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminKeuangan\PembelianRequest;
use App\Models\PembelianBarang;
use App\Models\Anggota;
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PembelianController extends Controller
{
    public function index(Request $request)
    {
        $cari      = $request->query('cari');
        $idAnggota = $request->query('anggota');

        $list = PembelianBarang::with(['anggota:id_anggota,nama_lengkap', 'barang:id_barang,nama_barang,kode_barang'])
            ->when($idAnggota, fn ($q) => $q->where('id_anggota', $idAnggota))
            ->when($cari, fn ($q) => $q->whereHas('anggota',
                fn ($a) => $a->where('nama_lengkap', 'like', "%{$cari}%")))
            ->orderByDesc('tanggal_pembelian')
            ->orderByDesc('id_pembelian')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($p) => [
                'id_pembelian'      => $p->id_pembelian,
                'nama_anggota'      => $p->anggota?->nama_lengkap ?? '-',
                'id_anggota'        => $p->id_anggota,
                'nama_barang'       => $p->barang?->nama_barang ?? '-',
                'id_barang'         => $p->id_barang,
                'jumlah'            => (float) $p->jumlah,
                'satuan'            => $p->satuan,
                'harga_satuan'      => (float) $p->harga_satuan,
                'total_harga'       => (float) $p->total_harga,
                'tanggal_pembelian' => $p->tanggal_pembelian->toDateString(),
                'keterangan'        => $p->keterangan,
            ]);

        return Inertia::render('AdminKeuangan/Pembelian', [
            'pembelian' => $list,
            'filter'    => ['cari' => $cari, 'anggota' => $idAnggota],
            'daftarAnggota' => Anggota::where('status_keanggotaan', 'aktif')
                ->orderBy('nama_lengkap')
                ->get(['id_anggota', 'nama_lengkap']),
            // stok_tersedia ikut dikirim agar UI bisa menampilkan & memperingatkan
            'daftarBarang' => Barang::where('status_aktif', 1)
                ->orderBy('nama_barang')
                ->get(['id_barang', 'nama_barang', 'kode_barang', 'harga_jual', 'satuan_default', 'stok_tersedia']),
        ]);
    }

    public function store(PembelianRequest $request)
    {
        DB::transaction(function () use ($request) {
            $data   = $request->validated();
            $barang = Barang::where('id_barang', $data['id_barang'])->lockForUpdate()->firstOrFail();

            $this->pastikanStokCukup($barang, $data['jumlah']);

            PembelianBarang::create([
                ...$data,
                'satuan'       => $barang->satuan_default,
                'harga_satuan' => $barang->harga_jual,
                'total_harga'  => $data['jumlah'] * $barang->harga_jual,
                'id_pengguna'  => auth('sikuda')->id(),
            ]);

            $barang->decrement('stok_tersedia', $data['jumlah']);
        });

        return back()->with('sukses', 'Transaksi pembelian berhasil ditambahkan & stok diperbarui.');
    }

    public function update(PembelianRequest $request, int $id)
    {
        DB::transaction(function () use ($request, $id) {
            $data      = $request->validated();
            $pembelian = PembelianBarang::lockForUpdate()->findOrFail($id);

            // 1. Kembalikan stok barang LAMA
            $barangLama = Barang::where('id_barang', $pembelian->id_barang)->lockForUpdate()->first();
            if ($barangLama) {
                $barangLama->increment('stok_tersedia', $pembelian->jumlah);
            }

            // 2. Ambil barang BARU (bisa sama, bisa beda) — sudah ter-update jika sama
            $barangBaru = Barang::where('id_barang', $data['id_barang'])->lockForUpdate()->firstOrFail();
            $barangBaru->refresh(); // pastikan nilai stok terbaru setelah langkah 1

            $this->pastikanStokCukup($barangBaru, $data['jumlah']);

            // 3. Update transaksi + potong stok barang baru
            $pembelian->update([
                ...$data,
                'satuan'       => $barangBaru->satuan_default,
                'harga_satuan' => $barangBaru->harga_jual,
                'total_harga'  => $data['jumlah'] * $barangBaru->harga_jual,
            ]);

            $barangBaru->decrement('stok_tersedia', $data['jumlah']);
        });

        return back()->with('sukses', 'Transaksi pembelian berhasil diperbarui & stok disesuaikan.');
    }

    public function destroy(int $id)
    {
        DB::transaction(function () use ($id) {
            $pembelian = PembelianBarang::lockForUpdate()->findOrFail($id);

            // Kembalikan stok sebelum hapus
            Barang::where('id_barang', $pembelian->id_barang)
                ->lockForUpdate()
                ->first()?->increment('stok_tersedia', $pembelian->jumlah);

            $pembelian->delete();
        });

        return back()->with('sukses', 'Transaksi pembelian dihapus & stok dikembalikan.');
    }

    /** Lempar error pada field 'jumlah' jika stok tidak mencukupi */
    private function pastikanStokCukup(Barang $barang, float $jumlah): void
    {
        if ($barang->stok_tersedia < $jumlah) {
            throw ValidationException::withMessages([
                'jumlah' => "Stok {$barang->nama_barang} tidak mencukupi. Sisa: "
                    . rtrim(rtrim(number_format($barang->stok_tersedia, 2, ',', '.'), '0'), ',')
                    . " {$barang->satuan_default}.",
            ]);
        }
    }
}
