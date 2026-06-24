<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PenjualanTbsSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_keuangan')->value('id_pengguna') ?? 1;

        // Harga berlaku = record harga TBS terbaru
        $harga = (float) DB::table('tb_harga_tbs')
            ->orderByDesc('berlaku_mulai')->orderByDesc('id_harga')
            ->value('harga_per_kg');

        $anggota = DB::table('tb_anggota')
            ->where('status_keanggotaan', 'aktif')
            ->get(['id_anggota', 'nama_lengkap']);

        foreach ($anggota as $a) {
            for ($t = 0; $t < rand(1, 2); $t++) {
                $berat   = rand(500, 3000) + (rand(0, 99) / 100);
                $total   = round($berat * $harga, 2);
                $tanggal = Carbon::create(2026, 6, rand(1, 13))->toDateString();

                // 1. Catat penjualan (snapshot harga)
                $idPenjualan = DB::table('tb_penjualan_tbs')->insertGetId([
                    'id_anggota'      => $a->id_anggota,
                    'berat_bersih_kg' => $berat,
                    'harga_per_kg'    => $harga,
                    'total_nilai'     => $total,
                    'tanggal_timbang' => $tanggal,
                    'id_pengguna'     => $idPengguna,
                    'dibuat_pada'     => $now,
                    'diperbarui_pada' => null,
                ], 'id_penjualan');

                // 2. Tafsir A — auto-posting KAS MASUK terkait penjualan ini
                DB::table('tb_transaksi_kas')->insert([
                    'jenis_kas'         => 'masuk',
                    'nominal'           => $total,
                    'keterangan'        => "Penjualan TBS — {$a->nama_lengkap} ({$berat} kg)",
                    'tanggal_transaksi' => $tanggal,
                    'id_pengguna'       => $idPengguna,
                    'tipe_referensi'    => 'penjualan_tbs',
                    'id_referensi'      => $idPenjualan,
                    'dibuat_pada'       => $now,
                    'diperbarui_pada'   => null,
                ]);
            }
        }
    }
}
