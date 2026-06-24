<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransaksiKasSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_keuangan')->value('id_pengguna') ?? 1;

        // CATATAN: kas dari Penjualan TBS & Penyaluran Dana TIDAK ditanam di sini.
        // Keduanya auto-posting dari seeder masing-masing (Tafsir A) agar tidak dobel.
        $masuk = [
            'Pendapatan jasa transportasi', 'Pembayaran cicilan pinjaman anggota',
            'Bunga simpanan bank', 'Setoran modal usaha simpan pinjam',
        ];
        $keluar = [
            'Pembayaran listrik kantor', 'Pembelian ATK', 'Gaji karyawan',
            'Biaya operasional pabrik pupuk', 'Perawatan kendaraan transportasi',
            'Biaya pemeliharaan timbangan RAM',
        ];

        $data = [];
        for ($hari = 0; $hari < 45; $hari++) {
            $tanggal = Carbon::create(2026, 5, 1)->addDays($hari);
            if ($tanggal->gt(Carbon::create(2026, 6, 13))) break;

            $data[] = [
                'jenis_kas'         => 'masuk',
                'nominal'           => rand(2, 15) * 500000,
                'keterangan'        => $masuk[array_rand($masuk)],
                'tanggal_transaksi' => $tanggal->toDateString(),
                'id_pengguna'       => $idPengguna,
                'tipe_referensi'    => null, // manual
                'id_referensi'      => null,
                'dibuat_pada'       => $now,
                'diperbarui_pada'   => null,
            ];

            if ($hari % 2 === 0) {
                $data[] = [
                    'jenis_kas'         => 'keluar',
                    'nominal'           => rand(1, 12) * 300000,
                    'keterangan'        => $keluar[array_rand($keluar)],
                    'tanggal_transaksi' => $tanggal->toDateString(),
                    'id_pengguna'       => $idPengguna,
                    'tipe_referensi'    => null,
                    'id_referensi'      => null,
                    'dibuat_pada'       => $now,
                    'diperbarui_pada'   => null,
                ];
            }
        }
        DB::table('tb_transaksi_kas')->insert($data);
    }
}
