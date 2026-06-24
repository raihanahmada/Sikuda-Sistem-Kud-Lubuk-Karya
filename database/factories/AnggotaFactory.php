<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AnggotaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nik' => $this->faker->unique()->numerify('################'), // 16 digit NIK
            'nama_lengkap' => $this->faker->name(),
            'alamat' => $this->faker->address(),
            'no_telepon' => substr($this->faker->phoneNumber(), 0, 15),
            'status_keanggotaan' => 'aktif',
            'tanggal_daftar' => $this->faker->date(),
        ];
    }
}