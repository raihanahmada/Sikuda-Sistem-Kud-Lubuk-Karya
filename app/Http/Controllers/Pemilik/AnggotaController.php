<?php

namespace App\Http\Controllers\Pemilik;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Inertia\Inertia;

class AnggotaController extends Controller
{
    public function index()
    {
        $anggota = Anggota::orderBy('tanggal_daftar', 'desc')->get([
            'id_anggota',
            'nik',
            'nama_lengkap',
            'alamat',
            'no_telepon',
            'status_keanggotaan',
            'tanggal_daftar',
            'tanggal_verifikasi',
            'no_surat_permohonan',
        ]);

        $statistik = [
            'total' => $anggota->count(),
            'aktif' => $anggota->where('status_keanggotaan', 'aktif')->count(),
            'pasif' => $anggota->where('status_keanggotaan', 'tidak_aktif')->count(),
        ];

        return Inertia::render('Pemilik/Anggota', [
            'anggota'   => $anggota,
            'statistik' => $statistik,
        ]);
    }
}