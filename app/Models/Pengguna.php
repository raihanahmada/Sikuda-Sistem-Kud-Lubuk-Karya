<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pengguna extends Authenticatable
{
    protected $table      = 'tb_pengguna';
    protected $primaryKey = 'id_pengguna';
    public    $timestamps = false;

    // Guard terpisah dari 'web' bawaan Breeze
    // Guard 'sikuda' didefinisikan di config/auth.php
    protected $fillable = [
        'nama_pengguna',
        'kata_sandi',
        'role',
    ];

    protected $hidden = [
        'kata_sandi',
    ];

    protected $casts = [
        'dibuat_pada'     => 'datetime',
        'diperbarui_pada' => 'datetime',
    ];

    // ── Wajib: mapping kolom password untuk Laravel Auth ──
    public function getAuthPassword(): string
    {
        return $this->kata_sandi;
    }

    // ── Helper: cek role ──────────────────────────────────
    public function isAdminAnggota(): bool
    {
        return $this->role === 'admin_anggota';
    }

    public function isAdminKeuangan(): bool
    {
        return $this->role === 'admin_keuangan';
    }

    public function isPemilik(): bool
    {
        return $this->role === 'pemilik';
    }

    // ── Relasi ────────────────────────────────────────────
    public function simpanan(): HasMany
    {
        return $this->hasMany(Simpanan::class, 'id_pengguna', 'id_pengguna');
    }

    public function transaksiKas(): HasMany
    {
        return $this->hasMany(TransaksiKas::class, 'id_pengguna', 'id_pengguna');
    }

    public function pembelianBarang(): HasMany
    {
        return $this->hasMany(PembelianBarang::class, 'id_pengguna', 'id_pengguna');
    }

    public function penjualanTbs(): HasMany
    {
        return $this->hasMany(PenjualanTbs::class, 'id_pengguna', 'id_pengguna');
    }

    public function penyaluranDana(): HasMany
    {
        return $this->hasMany(PenyaluranDana::class, 'id_pengguna', 'id_pengguna');
    }
}
