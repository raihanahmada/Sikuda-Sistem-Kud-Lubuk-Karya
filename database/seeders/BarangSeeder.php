<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarangSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $barang = [
            ['BRG-001', 'Pupuk NPK Mutiara 16-16-16', 'pupuk',               'kg',    320000],
            ['BRG-002', 'Pupuk Urea Subsidi',         'pupuk',               'kg',    250000],
            ['BRG-003', 'Pupuk KCl Mahkota',          'pupuk',               'kg',    410000],
            ['BRG-004', 'Herbisida Roundup 4L',       'obat_rumput',         'liter', 185000],
            ['BRG-005', 'Fungisida Dithane M-45',     'obat_penyakit_sawit', 'kg',    145000],
            ['BRG-006', 'Dodos Panen Sawit',          'alat_pertanian',      'unit',   95000],
            ['BRG-007', 'Egrek Galah Panen',          'alat_pertanian',      'unit',  175000],
            ['BRG-008', 'Karung Goni 50kg',           'lainnya',             'unit',    8500],
        ];

        $data = [];
        foreach ($barang as $b) {
            $data[] = [
                'kode_barang'     => $b[0],
                'nama_barang'     => $b[1],
                'kategori_barang' => $b[2],
                'satuan_default'  => $b[3],
                'harga_jual'      => $b[4],
                'stok_tersedia'   => rand(300, 1500), // cukup tinggi agar tak minus
                'deskripsi'       => 'Tersedia di unit pengadaan KUD Lubuk Karya',
                'status_aktif'    => 1,
                'dibuat_pada'     => $now,
                'diperbarui_pada' => null,
            ];
        }
        DB::table('tb_barang')->insert($data);
    }
}