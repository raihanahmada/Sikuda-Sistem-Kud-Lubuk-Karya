<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class HargaTbsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_keuangan')->value('id_pengguna') ?? 1;

        // Dua riwayat harga; yang terbaru (2850) = harga berlaku
        DB::table('tb_harga_tbs')->insert([
            [
                'harga_per_kg'    => 2750,
                'berlaku_mulai'   => Carbon::create(2026, 5, 1)->toDateString(),
                'id_pengguna'     => $idPengguna,
                'dibuat_pada'     => $now,
                'diperbarui_pada' => null,
            ],
            [
                'harga_per_kg'    => 2850, // ← berlaku (terbaru)
                'berlaku_mulai'   => Carbon::create(2026, 6, 1)->toDateString(),
                'id_pengguna'     => $idPengguna,
                'dibuat_pada'     => $now,
                'diperbarui_pada' => null,
            ],
        ]);
    }
}