<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Anggota extends Model
{
    use HasFactory;
    protected $table = 'tb_anggota';
    protected $primaryKey = 'id_anggota';

    // Laravel pakai kolom custom timestamp
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = 'diperbarui_pada';

    protected $fillable = [
        'nik',
        'nama_lengkap',
        'alamat',
        'no_telepon',
        'status_keanggotaan',
        'tanggal_daftar',
        'tanggal_verifikasi',
        'no_surat_permohonan',
        'alasan_penolakan',
    ];

    protected $casts = [
        'tanggal_daftar' => 'date',
        'tanggal_verifikasi' => 'date',
        'dibuat_pada' => 'datetime',
        'diperbarui_pada' => 'datetime',
    ];

    // =========================
    // Relasi
    // =========================

    public function simpanan(): HasMany
    {
        return $this->hasMany(Simpanan::class, 'id_anggota', 'id_anggota');
    }

    public function pembelianBarang(): HasMany
    {
        return $this->hasMany(PembelianBarang::class, 'id_anggota', 'id_anggota');
    }

    public function penjualanTbs(): HasMany
    {
        return $this->hasMany(PenjualanTbs::class, 'id_anggota', 'id_anggota');
    }

    public function penyaluranDana(): HasMany
    {
        return $this->hasMany(PenyaluranDana::class, 'id_anggota', 'id_anggota');
    }
}