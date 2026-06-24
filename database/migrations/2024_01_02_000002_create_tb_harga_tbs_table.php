<?php
// database/migrations/2024_01_02_000002_create_tb_harga_tbs_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tb_harga_tbs', function (Blueprint $table) {
            $table->bigIncrements('id_harga');
            $table->decimal('harga_per_kg', 15, 2);
            $table->date('berlaku_mulai');
            $table->unsignedBigInteger('id_pengguna');
            $table->dateTime('dibuat_pada')->nullable();
            $table->dateTime('diperbarui_pada')->nullable();
        });
    }
    public function down(): void { Schema::dropIfExists('tb_harga_tbs'); }
};