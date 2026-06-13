<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenyaluranDana extends Model
{
    protected $table = 'tb_penyaluran_dana';
    protected $primaryKey = 'id_penyaluran';
    public $timestamps = false;

    protected $fillable = [
        'id_anggota',
        'id_penjualan',
        'total_penjualan',
        'total_potongan',
        'dana_bersih',
        'tanggal_penyaluran',
        'keterangan',
        'id_pengguna',
    ];

    protected $casts = [
        'total_penjualan'    => 'decimal:2',
        'total_potongan'     => 'decimal:2',
        'dana_bersih'        => 'decimal:2',
        'tanggal_penyaluran' => 'date',
        'dibuat_pada'        => 'datetime',
        'diperbarui_pada'    => 'datetime',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function anggota(): BelongsTo
    {
        return $this->belongsTo(Anggota::class, 'id_anggota', 'id_anggota');
    }

    public function penjualanTbs(): BelongsTo
    {
        return $this->belongsTo(PenjualanTbs::class, 'id_penjualan', 'id_penjualan');
    }

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }
}
