<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_anggota', function (Blueprint $table) {
            $table->id('id_anggota');
            $table->string('nik', 16)->unique();
            $table->string('nama_lengkap', 100);
            $table->text('alamat');
            $table->string('no_telepon', 15)->nullable();
            $table->enum('status_keanggotaan', [
                'menunggu_verifikasi',
                'aktif',
                'pasif',
                'ditolak',
                'keluar',
            ]);
            $table->date('tanggal_daftar');
            $table->date('tanggal_verifikasi')->nullable();
            $table->string('no_surat_permohonan', 50)->nullable();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_anggota');
    }
};
