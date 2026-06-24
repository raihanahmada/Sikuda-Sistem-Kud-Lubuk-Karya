<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransaksiKas extends Model
{
    protected $table = 'tb_transaksi_kas';
    protected $primaryKey = 'id_transaksi';
    public $timestamps = false;

    protected $fillable = [
        'jenis_kas',
        'nominal',
        'keterangan',
        'tanggal_transaksi',
        'id_pengguna',
    ];

    protected $casts = [
        'nominal'           => 'decimal:2',
        'tanggal_transaksi' => 'date',
        'dibuat_pada'       => 'datetime',
        'diperbarui_pada'   => 'datetime',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }
}