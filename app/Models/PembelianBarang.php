<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PembelianBarang extends Model
{
    protected $table = 'tb_pembelian_barang';
    protected $primaryKey = 'id_pembelian';
    public $timestamps = false;

    protected $fillable = [
        'id_anggota',
        'id_barang',
        'jumlah',
        'satuan',
        'harga_satuan',
        'total_harga',
        'tanggal_pembelian',
        'keterangan',
        'id_pengguna',
    ];

    protected $casts = [
        'jumlah'            => 'decimal:2',
        'harga_satuan'      => 'decimal:2',
        'total_harga'       => 'decimal:2',
        'tanggal_pembelian' => 'date',
        'dibuat_pada'       => 'datetime',
        'diperbarui_pada'   => 'datetime',
    ];

    // ── Relasi ──────────────────────────────────────────────

    public function anggota(): BelongsTo
    {
        return $this->belongsTo(Anggota::class, 'id_anggota', 'id_anggota');
    }

    public function barang(): BelongsTo
    {
        return $this->belongsTo(Barang::class, 'id_barang', 'id_barang');
    }

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id_pengguna');
    }
}
