<?php

namespace Database\Factories;

use App\Models\Anggota;
use Illuminate\Database\Eloquent\Factories\Factory;

class PenjualanTbsFactory extends Factory
{
    public function definition(): array
    {
        $berat = $this->faker->numberBetween(300, 5000);

        $harga = $this->faker->numberBetween(
            2500,
            3500
        );

        return [
            'id_anggota' =>
                Anggota::inRandomOrder()
                    ->first()?->id_anggota,

            'berat_bersih_kg' => $berat,

            'harga_per_kg' => $harga,

            'total_nilai' => $berat * $harga,

            'tanggal_timbang' =>
                $this->faker->dateTimeBetween('-1 month'),

            'id_pengguna' => 1,
        ];
    }
}