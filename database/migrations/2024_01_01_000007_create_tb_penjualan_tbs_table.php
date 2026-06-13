<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_penjualan_tbs', function (Blueprint $table) {
            $table->id('id_penjualan');
            $table->unsignedBigInteger('id_anggota');
            $table->decimal('berat_bersih_kg', 10, 2);
            $table->decimal('harga_per_kg', 15, 2);
            $table->decimal('total_nilai', 15, 2);
            $table->date('tanggal_timbang');
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
        Schema::dropIfExists('tb_penjualan_tbs');
    }
};
