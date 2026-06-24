<?php

namespace App\Http\Controllers\AdminAnggota;

// Karena berada di subfolder, kita wajib memanggil Base Controller utama Laravel
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman Dashboard Admin Anggota
     */
    public function index()
    {
        // Mengirimkan data statistik persis seperti di Figma
        return Inertia::render('AdminAnggota/Dashboard', [
            'stats' => [
                'total_anggota' => '1.250',
                'aktif' => '1.100',
                'pasif' => '150',
                'anggota_baru' => '45',
                'menunggu_verifikasi' => '30'
            ]
        ]);
    }
};
