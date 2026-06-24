<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengaturanAdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tb_pengaturan_admin')->insert([
            'nama_admin' => 'Admin Anggota',
            'username' => 'adminanggota',
            'email' => 'adminanggota@kud.com',
            'no_telepon' => '081234567890',
            'foto' => null,
        ]);
    }
}