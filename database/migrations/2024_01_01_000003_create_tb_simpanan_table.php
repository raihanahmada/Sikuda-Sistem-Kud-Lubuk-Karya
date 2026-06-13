<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_simpanan', function (Blueprint $table) {
            $table->id('id_simpanan');
            $table->unsignedBigInteger('id_anggota');
            $table->enum('jenis_simpanan', ['pokok', 'wajib', 'pengambilan']);
            $table->decimal('jumlah', 15, 2);
            $table->date('tanggal_transaksi');
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('id_pengguna');
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();

            $table->foreign('id_anggota')
                ->references('id_anggota')
                ->on('tb_anggota')
                ->onDelete('restrict');

            $table->foreign('id_pengguna')
                ->references('id_pengguna')
                ->on('tb_pengguna')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_simpanan');
    }
};
