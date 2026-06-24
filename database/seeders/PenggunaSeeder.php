<?php

namespace Database\Seeders;

use App\Models\Pengguna;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PenggunaSeeder extends Seeder
{
    public function run(): void
    {
        $akun = [
            [
                'nama_pengguna' => 'admin_anggota',
                'kata_sandi'    => Hash::make('admin_anggota123'),
                'role'          => 'admin_anggota',
                'dibuat_pada'   => now(),
            ],
            [
                'nama_pengguna' => 'admin_keuangan',
                'kata_sandi'    => Hash::make('admin_keuangan123'),
                'role'          => 'admin_keuangan',
                'dibuat_pada'   => now(),
            ],
            [
                'nama_pengguna' => 'pemilik',
                'kata_sandi'    => Hash::make('pemilik123'),
                'role'          => 'pemilik',
                'dibuat_pada'   => now(),
            ],
        ];

        foreach ($akun as $data) {
            Pengguna::updateOrCreate(
                ['nama_pengguna' => $data['nama_pengguna']],
                $data
            );
        }

        $this->command->info('✅ 3 akun SIKUDA berhasil dibuat:');
        $this->command->table(
            ['Username', 'Password', 'Role'],
            [
                ['admin_anggota',  'admin_anggota123',  'admin_anggota'],
                ['admin_keuangan', 'admin_keuangan123', 'admin_keuangan'],
                ['pemilik',        'pemilik123',        'pemilik'],
            ]
        );
    }
}