<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_penyaluran_dana', function (Blueprint $table) {
            $table->id('id_penyaluran');
            $table->unsignedBigInteger('id_anggota');
            $table->unsignedBigInteger('id_penjualan');
            $table->decimal('total_penjualan', 15, 2);
            $table->decimal('total_potongan', 15, 2);
            $table->decimal('dana_bersih', 15, 2);
            $table->date('tanggal_penyaluran');
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('id_pengguna');
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();

            $table->foreign('id_anggota')
                ->references('id_anggota')
                ->on('tb_anggota')
                ->onDelete('restrict');

            $table->foreign('id_penjualan')
                ->references('id_penjualan')
                ->on('tb_penjualan_tbs')
                ->onDelete('restrict');

            $table->foreign('id_pengguna')
                ->references('id_pengguna')
                ->on('tb_pengguna')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_penyaluran_dana');
    }
};
