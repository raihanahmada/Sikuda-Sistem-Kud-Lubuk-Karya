<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_transaksi_kas', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->enum('jenis_kas', ['masuk', 'keluar']);
            $table->decimal('nominal', 15, 2);
            $table->text('keterangan');
            $table->date('tanggal_transaksi');
            $table->unsignedBigInteger('id_pengguna');
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();

            $table->foreign('id_pengguna')
                ->references('id_pengguna')
                ->on('tb_pengguna')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_transaksi_kas');
    }
};
