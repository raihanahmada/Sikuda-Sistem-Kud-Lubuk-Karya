<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PenyaluranDanaSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_keuangan')->value('id_pengguna') ?? 1;

        // Tiap penjualan TBS → satu penyaluran dana (1:1)
        $penjualan = DB::table('tb_penjualan_tbs as p')
            ->join('tb_anggota as a', 'a.id_anggota', '=', 'p.id_anggota')
            ->get(['p.id_penjualan', 'p.id_anggota', 'p.total_nilai', 'p.tanggal_timbang', 'a.nama_lengkap']);

        foreach ($penjualan as $p) {
            $potongan   = round($p->total_nilai * 0.12, 2); // biaya kebun 12%
            $danaBersih = round($p->total_nilai - $potongan, 2);
            $tanggal    = Carbon::parse($p->tanggal_timbang)->addDays(2)->toDateString();

            // 1. Catat penyaluran
            $idPenyaluran = DB::table('tb_penyaluran_dana')->insertGetId([
                'id_anggota'         => $p->id_anggota,
                'id_penjualan'       => $p->id_penjualan,
                'total_penjualan'    => $p->total_nilai,
                'total_potongan'     => $potongan,
                'dana_bersih'        => $danaBersih,
                'tanggal_penyaluran' => $tanggal,
                'keterangan'         => 'Penyaluran hasil penjualan TBS setelah potongan biaya kebun',
                'id_pengguna'        => $idPengguna,
                'dibuat_pada'        => $now,
                'diperbarui_pada'    => null,
            ], 'id_penyaluran');

            // 2. Tafsir A — auto-posting KAS KELUAR terkait penyaluran ini
            DB::table('tb_transaksi_kas')->insert([
                'jenis_kas'         => 'keluar',
                'nominal'           => $danaBersih,
                'keterangan'        => "Penyaluran dana TBS — {$p->nama_lengkap}",
                'tanggal_transaksi' => $tanggal,
                'id_pengguna'       => $idPengguna,
                'tipe_referensi'    => 'penyaluran_dana',
                'id_referensi'      => $idPenyaluran,
                'dibuat_pada'       => $now,
                'diperbarui_pada'   => null,
            ]);
        }
    }
}
