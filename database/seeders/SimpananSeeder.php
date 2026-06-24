<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SimpananSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_anggota')->value('id_pengguna') ?? 1;
        $anggota = DB::table('tb_anggota')->where('status_keanggotaan', 'aktif')->pluck('id_anggota');

        $data = [];
        foreach ($anggota as $idAnggota) {
            $data[] = [
                'id_anggota'        => $idAnggota,
                'jenis_simpanan'    => 'pokok',
                'jumlah'            => 500000,
                'tanggal_transaksi' => Carbon::create(2026, 1, 15)->toDateString(),
                'keterangan'        => 'Simpanan pokok keanggotaan',
                'id_pengguna'       => $idPengguna,
                'dibuat_pada'       => $now,
                'diperbarui_pada'   => null,
            ];
            foreach ([3, 4, 5, 6] as $bulan) {
                $data[] = [
                    'id_anggota'        => $idAnggota,
                    'jenis_simpanan'    => 'wajib',
                    'jumlah'            => 100000,
                    'tanggal_transaksi' => Carbon::create(2026, $bulan, 5)->toDateString(),
                    'keterangan'        => 'Simpanan wajib bulan ' . $bulan,
                    'id_pengguna'       => $idPengguna,
                    'dibuat_pada'       => $now,
                    'diperbarui_pada'   => null,
                ];
            }
        }
        foreach ($anggota->take(3) as $idAnggota) {
            $data[] = [
                'id_anggota'        => $idAnggota,
                'jenis_simpanan'    => 'pengambilan',
                'jumlah'            => 150000,
                'tanggal_transaksi' => Carbon::create(2026, 6, 8)->toDateString(),
                'keterangan'        => 'Penarikan simpanan anggota',
                'id_pengguna'       => $idPengguna,
                'dibuat_pada'       => $now,
                'diperbarui_pada'   => null,
            ];
        }
        DB::table('tb_simpanan')->insert($data);
    }
}
