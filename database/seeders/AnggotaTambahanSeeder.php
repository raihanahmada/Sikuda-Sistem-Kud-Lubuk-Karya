<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Menambah data dummy tambahan untuk role Admin Anggota, TANPA menyentuh/menghapus
// data yang sudah ada (AnggotaSeeder & tabel lain tetap utuh — ini murni menambah baris baru):
// - 30 anggota berstatus 'menunggu_verifikasi' (tampil di Pendaftaran Anggota & Verifikasi Anggota)
// - 40 anggota berstatus aktif/pasif/keluar (tampil di Data Anggota)
// - Simpanan mengikuti anggota aktif/pasif yang baru ditambahkan
class AnggotaTambahanSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('id_ID');
        $now = now();
        $idPengguna = DB::table('tb_pengguna')->where('role', 'admin_anggota')->value('id_pengguna') ?? 1;

        // Nomor surat lanjutan supaya tidak tampak duplikat dengan AnggotaSeeder (SP/2026/001..015)
        $noSurat = 100;
        $nikDipakai = [];

        $buatNik = function () use ($faker, &$nikDipakai) {
            do {
                // Prefix 36xx supaya tidak pernah bentrok dengan NIK contoh lama (prefix 14710...)
                $nik = '36' . $faker->numerify('##############');
            } while (isset($nikDipakai[$nik]));
            $nikDipakai[$nik] = true;
            return $nik;
        };

        // ===== 1. Anggota menunggu verifikasi (Pendaftaran Anggota & Verifikasi Anggota) =====
        $menungguIds = [];
        for ($i = 0; $i < 30; $i++) {
            $tglDaftar = Carbon::now()->subDays(rand(1, 60));
            $id = DB::table('tb_anggota')->insertGetId([
                'nik'                 => $buatNik(),
                'nama_lengkap'        => $faker->name(),
                'alamat'              => $faker->address(),
                'no_telepon'          => '08' . $faker->numerify('##########'),
                'status_keanggotaan'  => 'menunggu_verifikasi',
                'tanggal_daftar'      => $tglDaftar->toDateString(),
                'tanggal_verifikasi'  => null,
                'no_surat_permohonan' => 'SP/2026/' . str_pad((string) (++$noSurat), 3, '0', STR_PAD_LEFT),
                'alasan_penolakan'    => null,
                'dibuat_pada'         => $now,
                'diperbarui_pada'     => null,
            ], 'id_anggota');
            $menungguIds[] = $id;
        }

        // ===== 2. Anggota aktif/pasif/keluar (Data Anggota) =====
        // 30 aktif, 6 pasif, 4 keluar = 40 total
        $statusPool = array_merge(
            array_fill(0, 30, 'aktif'),
            array_fill(0, 6, 'pasif'),
            array_fill(0, 4, 'keluar'),
        );
        shuffle($statusPool);

        $simpananAnggota = []; // id_anggota aktif/pasif yang perlu diberi riwayat simpanan

        foreach ($statusPool as $status) {
            $tglDaftar = Carbon::now()->subDays(rand(60, 540));
            $tglVerifikasi = $tglDaftar->copy()->addDays(rand(2, 5));
            $id = DB::table('tb_anggota')->insertGetId([
                'nik'                 => $buatNik(),
                'nama_lengkap'        => $faker->name(),
                'alamat'              => $faker->address(),
                'no_telepon'          => '08' . $faker->numerify('##########'),
                'status_keanggotaan'  => $status,
                'tanggal_daftar'      => $tglDaftar->toDateString(),
                'tanggal_verifikasi'  => $tglVerifikasi->toDateString(),
                'no_surat_permohonan' => 'SP/2026/' . str_pad((string) (++$noSurat), 3, '0', STR_PAD_LEFT),
                'alasan_penolakan'    => null,
                'dibuat_pada'         => $now,
                'diperbarui_pada'     => $now,
            ], 'id_anggota');

            if (in_array($status, ['aktif', 'pasif'])) {
                $simpananAnggota[] = ['id' => $id, 'sejak' => $tglVerifikasi];
            }
        }

        // ===== 3. Riwayat Simpanan untuk anggota aktif/pasif yang baru =====
        $dataSimpanan = [];
        foreach ($simpananAnggota as $a) {
            // Simpanan pokok, sekali di awal keanggotaan
            $dataSimpanan[] = [
                'id_anggota'        => $a['id'],
                'jenis_simpanan'    => 'pokok',
                'jumlah'            => 500000,
                'tanggal_transaksi' => $a['sejak']->copy()->addDay()->toDateString(),
                'keterangan'        => 'Simpanan pokok keanggotaan',
                'id_pengguna'       => $idPengguna,
                'dibuat_pada'       => $now,
                'diperbarui_pada'   => null,
            ];

            // Simpanan wajib bulanan, sebanyak beberapa bulan sejak diverifikasi
            $jumlahBulan = rand(3, 8);
            for ($b = 1; $b <= $jumlahBulan; $b++) {
                $tglWajib = $a['sejak']->copy()->addMonths($b);
                if ($tglWajib->isAfter($now)) {
                    break;
                }
                $dataSimpanan[] = [
                    'id_anggota'        => $a['id'],
                    'jenis_simpanan'    => 'wajib',
                    'jumlah'            => rand(8, 15) * 10000,
                    'tanggal_transaksi' => $tglWajib->toDateString(),
                    'keterangan'        => 'Simpanan wajib bulan ke-' . $b,
                    'id_pengguna'       => $idPengguna,
                    'dibuat_pada'       => $now,
                    'diperbarui_pada'   => null,
                ];
            }

            // Sebagian kecil anggota pernah melakukan penarikan
            if (rand(1, 100) <= 20) {
                $dataSimpanan[] = [
                    'id_anggota'        => $a['id'],
                    'jenis_simpanan'    => 'pengambilan',
                    'jumlah'            => rand(5, 15) * 10000,
                    'tanggal_transaksi' => $a['sejak']->copy()->addMonths(rand(2, $jumlahBulan))->min($now)->toDateString(),
                    'keterangan'        => 'Penarikan simpanan anggota',
                    'id_pengguna'       => $idPengguna,
                    'dibuat_pada'       => $now,
                    'diperbarui_pada'   => null,
                ];
            }
        }

        foreach (array_chunk($dataSimpanan, 200) as $chunk) {
            DB::table('tb_simpanan')->insert($chunk);
        }
    }
}
