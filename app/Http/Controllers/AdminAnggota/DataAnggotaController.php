<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DataAnggotaController extends Controller
{
    public function index(Request $request)
    {
        $query = Anggota::whereIn('status_keanggotaan', ['aktif', 'pasif', 'keluar']);

        // Filter status (server-side)
        if ($request->filled('status')) {
            $query->where('status_keanggotaan', $request->status);
        }

        // ===== PENERAPAN MATERI: useEffect Search Server-Side (Pertemuan 11) =====
        // Controller menerima parameter 'search' dari React (via router.get)
        // dan memfilter data di database langsung (bukan di React)
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                  ->orWhere('nik', 'like', "%{$request->search}%");
            });
        }
        // ===== AKHIR PENERAPAN =====

        // ===== PENERAPAN MATERI: Pagination Server-Side (pola sama seperti Admin Keuangan, 10 data/halaman) =====
        // Anggota yang paling baru mendaftar tampil paling atas
        $dataAnggota = $query->orderByDesc('tanggal_daftar')->orderByDesc('id_anggota')->paginate(10)->withQueryString();
        // ===== AKHIR PENERAPAN =====

        return Inertia::render('AdminAnggota/DataAnggota/Index', [
            'dataAnggota' => $dataAnggota,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function destroy($id)
    {
        $anggota = Anggota::findOrFail($id);
        if ($anggota->simpanan()->count() > 0 || $anggota->penjualanTbs()->count() > 0 || $anggota->pembelianBarang()->count() > 0) {
            return back()->with('error', 'Data tidak dapat dihapus karena masih memiliki transaksi aktif.');
        }
        $anggota->delete();
        return back()->with('sukses', 'Data anggota berhasil dihapus.');
    }

    public function edit($id)
    {
        $anggota = Anggota::findOrFail($id);
        return Inertia::render('AdminAnggota/DataAnggota/Edit', ['anggota' => $anggota]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'nullable|string|max:15',
            'status_keanggotaan' => 'required|in:aktif,pasif,keluar'
        ]);
        $anggota = Anggota::findOrFail($id);
        $anggota->update($validated);
        return back()->with('sukses', 'Data anggota berhasil diperbarui.');
    }
}