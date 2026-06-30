<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use App\Models\Simpanan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VerifikasiController extends Controller
{
    // Menampilkan antrian verifikasi (status: menunggu_verifikasi)
    public function index()
    {
        $antrian = Anggota::where('status_keanggotaan', 'menunggu_verifikasi')->latest()->get();

        $stats = [
            'menunggu' => $antrian->count(),
            'diterima' => Anggota::where('status_keanggotaan', 'aktif')->whereDate('tanggal_verifikasi', today())->count(),
            'ditolak' => Anggota::where('status_keanggotaan', 'ditolak')->whereDate('tanggal_verifikasi', today())->count(),
        ];

        return Inertia::render('AdminAnggota/Verifikasi/Index', compact('antrian', 'stats'));
    }

    // Menampilkan detail verifikasi
    public function show($id)
    {
        $anggota = Anggota::with('dataPendaftaran')->findOrFail($id);
        return Inertia::render('AdminAnggota/Verifikasi/Show', ['anggota' => $anggota]);
    }

    // Aksi TERIMA: Sesuai SKPL UC04 (Ubah status aktif & catat simpanan pokok)
    public function terima($id)
    {
        $anggota = Anggota::findOrFail($id);
        
        $anggota->update([
            'status_keanggotaan' => 'aktif',
            'tanggal_verifikasi' => now()
        ]);

        Simpanan::create([
            'id_anggota' => $anggota->id_anggota,
            'jenis_simpanan' => 'pokok',
            'jumlah' => 100000, // Default simpanan pokok (sesuaikan jika ada nilai pasti)
            'tanggal_transaksi' => now(),
            'keterangan' => 'Simpanan Pokok Anggota Baru (Otomatis)',
            'id_pengguna' => Auth::id() ?? 1 // ID admin yang sedang login
        ]);

        return redirect()->route('admin-anggota.verifikasi.index')->with('success', 'Anggota berhasil diterima!');
    }

    // Aksi TOLAK: Sesuai SKPL UC04 (Ubah status ditolak & simpan alasan)
    public function tolak(Request $request, $id)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string'
        ]);

        $anggota = Anggota::findOrFail($id);
        
        $anggota->update([
            'status_keanggotaan' => 'ditolak',
            'tanggal_verifikasi' => now(),
            'alasan_penolakan' => $request->alasan_penolakan
        ]);

        return redirect()->route('admin-anggota.verifikasi.index')->with('success', 'Anggota ditolak!');
    }
}