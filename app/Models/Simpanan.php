<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Simpanan extends Model
{
    use HasFactory;
    protected $table = 'tb_simpanan';
    protected $primaryKey = 'id_simpanan';
    public $timestamps = false;

    protected $fillable = [
        'id_anggota',
        'jenis_simpanan',
        'jumlah',
        'tanggal_transaksi',
        'keterangan',
        'id_pengguna',
    ];

    protected $casts = [
        'jumlah'            => 'decimal:2',
        'tanggal_transaksi' => 'date',
        'dibuat_pada'       => 'datetime',
        'diperbarui_pada'   => 'datetime',
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
}
