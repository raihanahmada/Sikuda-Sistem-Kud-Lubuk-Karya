<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class DataPendaftaran extends Model
{
    use HasFactory;
    protected $table = 'tb_data_pendaftaran';
    protected $primaryKey = 'id_pendaftaran';

    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = 'diperbarui_pada';

    protected $fillable = [
        'id_anggota',
        'file_kk',
        'file_ktp',
        'file_surat_pernyataan',
    ];

    protected $appends = [
        'file_kk_url',
        'file_ktp_url',
        'file_surat_pernyataan_url',
    ];

    // =========================
    // Relasi
    // =========================

    public function anggota(): BelongsTo
    {
        return $this->belongsTo(Anggota::class, 'id_anggota', 'id_anggota');
    }

    // =========================
    // Accessor URL Dokumen
    // =========================

    public function getFileKkUrlAttribute(): ?string
    {
        return $this->file_kk ? Storage::disk('public')->url($this->file_kk) : null;
    }

    public function getFileKtpUrlAttribute(): ?string
    {
        return $this->file_ktp ? Storage::disk('public')->url($this->file_ktp) : null;
    }

    public function getFileSuratPernyataanUrlAttribute(): ?string
    {
        return $this->file_surat_pernyataan ? Storage::disk('public')->url($this->file_surat_pernyataan) : null;
    }
}
