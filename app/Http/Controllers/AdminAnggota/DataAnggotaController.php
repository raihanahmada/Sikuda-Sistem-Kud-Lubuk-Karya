<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataAnggotaController extends Controller
{
    // Menampilkan daftar anggota (Aktif, Pasif, Keluar)
    public function index(Request $request)
    {
        // Sesuai SKPL UC06: Hanya menampilkan Aktif, Pasif, dan Keluar
        $query = Anggota::whereIn('status_keanggotaan', ['aktif', 'pasif', 'keluar']);

        // Sesuai SKPL UC06 Sub Flow S.2: Filter Berdasarkan Status
        if ($request->filled('status')) {
            $query->where('status_keanggotaan', $request->status);
        }

        $dataAnggota = $query->latest()->get();

        return Inertia::render('AdminAnggota/DataAnggota/Index', [
            'dataAnggota' => $dataAnggota
        ]);
    }

    // Menghapus data anggota
    public function destroy($id)
    {
        $anggota = Anggota::findOrFail($id);
        
        // Sesuai SKPL UC06 Alt 3: Gagal hapus jika masih ada transaksi aktif
        if ($anggota->simpanan()->count() > 0 || $anggota->penjualanTbs()->count() > 0 || $anggota->pembelianBarang()->count() > 0) {
            return redirect()->back()->with('error', 'Data tidak dapat dihapus karena masih memiliki transaksi aktif.');
        }

        $anggota->delete();
        return redirect()->route('admin-anggota.data-anggota.index')->with('success', 'Data anggota berhasil dihapus.');
    }
    // Menampilkan halaman Edit Data Anggota
    public function edit($id)
    {
        $anggota = Anggota::findOrFail($id);
        
        return Inertia::render('AdminAnggota/DataAnggota/Edit', [
            'anggota' => $anggota
        ]);
    }

    // Memproses update data dan status anggota ke database
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'nullable|string|max:15',
            'status_keanggotaan' => 'required|in:aktif,pasif,keluar' // Sesuai aturan ENUM di DPPL
        ]);

        $anggota = Anggota::findOrFail($id);
        $anggota->update($validated);

        return redirect()->route('admin-anggota.data-anggota.index')
                         ->with('success', 'Data anggota berhasil diperbarui.');
    }
}