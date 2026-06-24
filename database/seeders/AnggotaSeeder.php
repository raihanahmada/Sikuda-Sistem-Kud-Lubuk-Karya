<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnggotaSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $nama = [
            'Budi Santoso', 'Siti Aminah', 'Rahmat Hidayat', 'Dewi Lestari', 'Agus Salim',
            'Nurhayati', 'Joko Widodo', 'Sri Wahyuni', 'Hendra Gunawan', 'Maya Sari',
            'Rudi Hartono', 'Fitri Handayani', 'Bambang Suryadi', 'Lina Marlina', 'Asep Sunandar',
        ];

        $data = [];
        foreach ($nama as $i => $n) {
            $status = match (true) {
                $i < 11    => 'aktif',
                $i === 11  => 'menunggu_verifikasi',
                $i === 12  => 'pasif',
                $i === 13  => 'ditolak',
                default    => 'keluar',
            };
            $tglDaftar = Carbon::create(2026, 1, 1)->addDays($i * 7);
            $aktif = in_array($status, ['aktif', 'pasif', 'keluar']);

            $data[] = [
                'nik'                 => '14710' . str_pad($i + 1, 11, '0', STR_PAD_LEFT),
                'nama_lengkap'        => $n,
                'alamat'              => 'Desa Lubuk Karya, Blok ' . chr(65 + ($i % 6)) . ' No. ' . ($i + 1),
                'no_telepon'          => '0812' . str_pad((string) rand(10000000, 99999999), 8, '0'),
                'status_keanggotaan'  => $status,
                'tanggal_daftar'      => $tglDaftar->toDateString(),
                'tanggal_verifikasi'  => $aktif ? $tglDaftar->copy()->addDays(3)->toDateString() : null,
                'no_surat_permohonan' => 'SP/2026/' . str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'alasan_penolakan'    => $status === 'ditolak' ? 'Berkas persyaratan tidak lengkap' : null,
                'dibuat_pada'         => $now,
                'diperbarui_pada'     => $aktif ? $now : null,
            ];
        }
        DB::table('tb_anggota')->insert($data);
    }
}
