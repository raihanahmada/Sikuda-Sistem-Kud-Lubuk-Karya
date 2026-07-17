<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PenggunaSeeder::class,
            AnggotaSeeder::class,
            AnggotaTambahanSeeder::class, // data dummy tambahan (30 menunggu verifikasi + 40 aktif/pasif/keluar)
            BarangSeeder::class,
            HargaTbsSeeder::class,        // ← BARU, sebelum penjualan TBS
            SimpananSeeder::class,
            TransaksiKasSeeder::class,    // kas operasional manual
            PembelianBarangSeeder::class, // memotong stok
            PenjualanTbsSeeder::class,    // auto-posting kas masuk
            PenyaluranDanaSeeder::class,  // auto-posting kas keluar
        ]);
    }
}