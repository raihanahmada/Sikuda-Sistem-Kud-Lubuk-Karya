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

                                                                    // ── Tafsir A: penanda baris kas hasil auto-posting ──
            $table->string('tipe_referensi', 30)->nullable();       // 'penjualan_tbs' | 'penyaluran_dana' | null (manual)
            $table->unsignedBigInteger('id_referensi')->nullable(); // id transaksi sumbernya

            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();

            $table->foreign('id_pengguna')
                ->references('id_pengguna')
                ->on('tb_pengguna')
                ->onDelete('restrict');

            // index gabungan untuk pencarian baris kas terkait saat edit/hapus
            $table->index(['tipe_referensi', 'id_referensi']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('tb_transaksi_kas');
    }
};
