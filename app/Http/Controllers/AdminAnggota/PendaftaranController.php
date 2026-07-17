<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PendaftaranController extends Controller
{
    public function index(Request $request)
    {
        $query = Anggota::where('status_keanggotaan', 'menunggu_verifikasi');

        // ===== PENERAPAN MATERI: useEffect Search Server-Side (Pertemuan 11) =====
        if ($request->filled('search')) {
            $query->where('nama_lengkap', 'like', "%{$request->search}%");
        }

        if ($request->filled('status')) {
            $query->where('status_keanggotaan', $request->status);
        }
        // ===== AKHIR PENERAPAN =====

        // ===== PENERAPAN MATERI: Pagination Server-Side (pola sama seperti Admin Keuangan, 10 data/halaman) =====
        // Anggota yang paling baru mendaftar tampil paling atas
        $pendaftar = $query->orderByDesc('tanggal_daftar')->orderByDesc('id_anggota')->paginate(10)->withQueryString();
        // ===== AKHIR PENERAPAN =====

        return Inertia::render('AdminAnggota/PendaftaranAnggota/Index', [
            'pendaftar' => $pendaftar,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('AdminAnggota/PendaftaranAnggota/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string|max:16|unique:tb_anggota,nik',
            'nama_lengkap' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'nullable|string|max:15',
            'tanggal_daftar' => 'required|date',
            'file_kk' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'file_ktp' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'file_surat_pernyataan' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $anggota = Anggota::create([
                'nik' => $validated['nik'],
                'nama_lengkap' => $validated['nama_lengkap'],
                'alamat' => $validated['alamat'],
                'no_telepon' => $validated['no_telepon'] ?? null,
                'tanggal_daftar' => $validated['tanggal_daftar'],
                'status_keanggotaan' => 'menunggu_verifikasi',
                'no_surat_permohonan' => 'SP/KUD/' . date('Y') . '/' . rand(1000, 9999),
            ]);

            $anggota->dataPendaftaran()->create([
                'file_kk' => $request->file('file_kk')->store('data-pendaftaran/kk', 'public'),
                'file_ktp' => $request->file('file_ktp')->store('data-pendaftaran/ktp', 'public'),
                'file_surat_pernyataan' => $request->file('file_surat_pernyataan')->store('data-pendaftaran/surat-pernyataan', 'public'),
            ]);
        });

        return back()->with('sukses', 'Anggota berhasil didaftarkan.');
    }

    public function show($id)
    {
        $anggota = Anggota::with('dataPendaftaran')->findOrFail($id);
        return Inertia::render('AdminAnggota/PendaftaranAnggota/Show', ['anggota' => $anggota]);
    }

    public function edit($id)
    {
        $anggota = Anggota::findOrFail($id);
        return Inertia::render('AdminAnggota/PendaftaranAnggota/Edit', ['anggota' => $anggota]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'nullable|string|max:15',
        ]);
        $anggota = Anggota::findOrFail($id);
        $anggota->update($validated);
        return back()->with('sukses', 'Data pendaftaran berhasil diperbarui.');
    }
}