<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_pengaturan_admin', function (Blueprint $table) {

            $table->id();

            $table->string('nama_admin');
            $table->string('username')->unique();
            $table->string('email');
            $table->string('no_telepon')->nullable();
            $table->string('foto')->nullable();

            $table->timestamp('dibuat_pada')->useCurrent();
            $table->timestamp('diperbarui_pada')
                  ->nullable()
                  ->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tb_pengaturan_admin');
    }
};