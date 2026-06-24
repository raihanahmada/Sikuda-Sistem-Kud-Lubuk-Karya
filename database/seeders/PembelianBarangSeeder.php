<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PembelianBarangSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_keuangan')->value('id_pengguna') ?? 1;

        $anggota = DB::table('tb_anggota')->where('status_keanggotaan', 'aktif')->pluck('id_anggota');
        $barang  = DB::table('tb_barang')->get(['id_barang', 'harga_jual', 'satuan_default']);

        $data = [];
        $pengurangan = []; // id_barang => total dikurangi

        foreach ($anggota as $idAnggota) {
            foreach (collect($barang)->random(rand(1, 3)) as $b) {
                $jumlah = rand(1, 10);
                $data[] = [
                    'id_anggota'        => $idAnggota,
                    'id_barang'         => $b->id_barang,
                    'jumlah'            => $jumlah,
                    'satuan'            => $b->satuan_default,
                    'harga_satuan'      => $b->harga_jual,
                    'total_harga'       => $jumlah * $b->harga_jual,
                    'tanggal_pembelian' => Carbon::create(2026, 6, rand(1, 13))->toDateString(),
                    'keterangan'        => 'Pembelian melalui unit pengadaan koperasi',
                    'id_pengguna'       => $idPengguna,
                    'dibuat_pada'       => $now,
                    'diperbarui_pada'   => null,
                ];
                $pengurangan[$b->id_barang] = ($pengurangan[$b->id_barang] ?? 0) + $jumlah;
            }
        }

        DB::table('tb_pembelian_barang')->insert($data);

        // Konsistensi stok: kurangi stok sesuai pembelian dummy
        foreach ($pengurangan as $idBarang => $totalKurang) {
            DB::table('tb_barang')->where('id_barang', $idBarang)
                ->decrement('stok_tersedia', $totalKurang);
        }
    }
}
