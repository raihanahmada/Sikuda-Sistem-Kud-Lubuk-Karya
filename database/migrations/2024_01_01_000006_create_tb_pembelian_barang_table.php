<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_pembelian_barang', function (Blueprint $table) {
            $table->id('id_pembelian');
            $table->unsignedBigInteger('id_anggota');
            $table->unsignedBigInteger('id_barang');
            $table->decimal('jumlah', 10, 2);
            $table->string('satuan', 20);
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('total_harga', 15, 2);
            $table->date('tanggal_pembelian');
            $table->text('keterangan')->nullable();
            $table->unsignedBigInteger('id_pengguna');
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();

            $table->foreign('id_anggota')
                ->references('id_anggota')
                ->on('tb_anggota')
                ->onDelete('restrict');

            $table->foreign('id_barang')
                ->references('id_barang')
                ->on('tb_barang')
                ->onDelete('restrict');

            $table->foreign('id_pengguna')
                ->references('id_pengguna')
                ->on('tb_pengguna')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_pembelian_barang');
    }
};
