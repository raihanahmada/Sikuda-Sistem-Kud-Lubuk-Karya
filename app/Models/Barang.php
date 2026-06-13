<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barang extends Model
{
    protected $table = 'tb_barang';
    protected $primaryKey = 'id_barang';
    public $timestamps = false;

    protected $fillable = [
        'kode_barang',
        'nama_barang',
        'kategori_barang',
        'satuan_default',
        'harga_jual',
        'stok_tersedia',
        'deskripsi',
        'status_aktif',
    ];

    protected $casts = [
        'harga_jual'      => 'decimal:2',
        'stok_tersedia'   => 'decimal:2',
        'status_aktif'    => 'boolean',
        'dibuat_pada'     => 'datetime',
        'diperbarui_pada' => 'datetime',
    ];

    // ── Scope ───────────────────────────────────────────────

    public function scopeAktif($query)
    {
        return $query->where('status_aktif', 1);
    }

    // ── Relasi ──────────────────────────────────────────────

    public function pembelianBarang(): HasMany
    {
        return $this->hasMany(PembelianBarang::class, 'id_barang', 'id_barang');
    }
}
