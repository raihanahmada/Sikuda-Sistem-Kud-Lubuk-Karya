<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\AnggotaSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PenggunaSeeder::class,
            AnggotaSeeder::class,
        ]);
    }
}
