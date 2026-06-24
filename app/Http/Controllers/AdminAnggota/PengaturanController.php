<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\PengaturanAdmin; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth; // Penting untuk Auth::id()

class PengaturanController extends Controller
{
    public function index()
    {
        // Menggunakan Auth::id() agar lebih stabil dan tidak merah
        $pengaturan = PengaturanAdmin::where('id_admin', Auth::id())->first();
        
        return Inertia::render('AdminAnggota/Pengaturan/Index', [
            'pengaturan' => $pengaturan
        ]);
    }

    public function update(Request $request)
    {
        // Validasi input sederhana (opsional tapi disarankan)
        $request->validate([
            'tema' => 'required|string',
            'notifikasi' => 'boolean',
            'jumlah_data' => 'required|integer'
        ]);

        // Update atau create pengaturan berdasarkan user ID
        PengaturanAdmin::updateOrCreate(
            ['id_admin' => Auth::id()],
            [
                'tema' => $request->tema,
                'notifikasi' => $request->notifikasi,
                'jumlah_data_per_halaman' => $request->jumlah_data
            ]
        );

        return redirect()->back()->with('message', 'Pengaturan berhasil disimpan!');
    }
}