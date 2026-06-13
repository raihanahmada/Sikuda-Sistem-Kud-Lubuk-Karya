<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_barang', function (Blueprint $table) {
            $table->id('id_barang');
            $table->string('kode_barang', 20)->unique();
            $table->string('nama_barang', 150);
            $table->enum('kategori_barang', [
                'pupuk',
                'alat_pertanian',
                'obat_rumput',
                'obat_penyakit_sawit',
                'lainnya',
            ]);
            $table->string('satuan_default', 20);
            $table->decimal('harga_jual', 15, 2);
            $table->decimal('stok_tersedia', 10, 2)->default(0);
            $table->text('deskripsi')->nullable();
            $table->tinyInteger('status_aktif')->default(1)->comment('1=Tersedia, 0=Tidak Tersedia');
            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')->nullable()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_barang');
    }
};
