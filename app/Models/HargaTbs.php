<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HargaTbs extends Model
{
    protected $table = 'tb_harga_tbs';
    protected $primaryKey = 'id_harga';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = 'diperbarui_pada';

    protected $fillable = ['harga_per_kg', 'berlaku_mulai', 'id_pengguna'];
    protected $casts = ['harga_per_kg' => 'decimal:2', 'berlaku_mulai' => 'date'];

    /** Harga yang sedang berlaku = record terbaru */
    public static function berlaku(): ?self
    {
        return static::orderByDesc('berlaku_mulai')->orderByDesc('id_harga')->first();
    }
}