<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PenjualanTbs extends Model
{
    protected $table = 'tb_penjualan_tbs';
    protected $primaryKey = 'id_penjualan';
    public $timestamps = false;

    protected $fillable = [
        'id_anggota',
        'berat_bersih_kg',
        'harga_per_kg',
        'total_nilai',
        'tanggal_timbang',
        'id_pengguna',
    ];

    protected $casts = [
        'berat_bersih_kg' => 'decimal:2',
        'harga_per_kg'    => 'decimal:2',
        'total_nilai'     => 'decimal:2',
        'tanggal_timbang' => 'date',
        'dibuat_pada'     => 'datetime',
        'diperbarui_pada' => 'datetime',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function anggota(): BelongsTo
    {
        return $this->belongsTo(Anggota::class, 'id_anggota', 'id_anggota');
    }

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }

    public function penyaluranDana(): HasMany
    {
        return $this->hasMany(PenyaluranDana::class, 'id_penjualan', 'id_penjualan');
    }
}
