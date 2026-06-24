<?php

namespace Database\Factories;

use App\Models\Anggota;
use Illuminate\Database\Eloquent\Factories\Factory;

class SimpananFactory extends Factory
{
    public function definition(): array
    {
        $jenis = $this->faker->randomElement([
            'pokok',
            'wajib',
            'pengambilan'
        ]);

        return [
            'id_anggota' => Anggota::inRandomOrder()
                ->first()?->id_anggota,

            'jenis_simpanan' => $jenis,

            'jumlah' => match ($jenis) {
                'pokok' => 1000000,
                'wajib' => $this->faker->numberBetween(
                    100000,
                    500000
                ),
                'pengambilan' => $this->faker->numberBetween(
                    50000,
                    300000
                ),
            },

            'tanggal_transaksi' =>
                $this->faker->dateTimeBetween(
                    '-6 months',
                    'now'
                ),

            'keterangan' => 'Transaksi Simpanan',

            'id_pengguna' => 1,
        ];
    }
}