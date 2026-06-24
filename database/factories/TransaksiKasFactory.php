<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class TransaksiKasFactory extends Factory
{
    public function definition(): array
    {
        return [
            'jenis_kas' => $this->faker->randomElement([
                'masuk',
                'keluar'
            ]),

            'nominal' => $this->faker->numberBetween(
                500000,
                10000000
            ),

            'keterangan' => $this->faker->sentence(),

            'tanggal_transaksi' =>
                $this->faker->dateTimeBetween('-1 month'),

            'id_pengguna' => 1,
        ];
    }
}