<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArsipSuratSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tb_arsip_surat')->insert([

            [
                'judul'=>'Surat Keanggotaan',
                'kategori'=>'Keanggotaan',
                'tanggal'=>'2026-06-10',
                'file'=>'surat1.pdf'
            ],

            [
                'judul'=>'Surat Permohonan Simpan Pinjam',
                'kategori'=>'Keuangan',
                'tanggal'=>'2026-06-12',
                'file'=>'surat2.pdf'
            ],

            [
                'judul'=>'Surat Pemberitahuan Rapat',
                'kategori'=>'Umum',
                'tanggal'=>'2026-06-15',
                'file'=>'surat3.pdf'
            ]

        ]);
    }
}