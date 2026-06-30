<?php

namespace App\Http\Controllers\AdminAnggota;

use App\Http\Controllers\Controller;
use App\Models\Anggota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PendaftaranController extends Controller
{
// 1. Menampilkan daftar pendaftaran (Hanya yang belum diverifikasi)
    public function index()
    {
        // PERBAIKAN: Hanya tampilkan yang statusnya 'menunggu_verifikasi'
        $pendaftar = Anggota::where('status_keanggotaan', 'menunggu_verifikasi')
                            ->latest()
                            ->get();

        // Lempar data '$pendaftar' ke halaman React (Index.jsx)
        return Inertia::render('AdminAnggota/PendaftaranAnggota/Index', [
            'pendaftar' => $pendaftar
        ]);
    }
    // 2. Menampilkan halaman form React
    public function create()
    {
        return Inertia::render('AdminAnggota/PendaftaranAnggota/Create');
    }

    // 3. Menerima data dari React dan menyimpannya ke Database
    public function store(Request $request)
    {
        // Validasi data yang dikirim dari form Create.jsx
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
            // Tambahkan data otomatis sesuai aturan di dokumen DPPL/SKPL
            $anggota = Anggota::create([
                'nik' => $validated['nik'],
                'nama_lengkap' => $validated['nama_lengkap'],
                'alamat' => $validated['alamat'],
                'no_telepon' => $validated['no_telepon'] ?? null,
                'tanggal_daftar' => $validated['tanggal_daftar'],
                'status_keanggotaan' => 'menunggu_verifikasi',
                'no_surat_permohonan' => 'SP/KUD/' . date('Y') . '/' . rand(1000, 9999),
            ]);

            // Simpan berkas persyaratan ke disk publik & data pendaftaran ke tb_data_pendaftaran
            $anggota->dataPendaftaran()->create([
                'file_kk' => $request->file('file_kk')->store('data-pendaftaran/kk', 'public'),
                'file_ktp' => $request->file('file_ktp')->store('data-pendaftaran/ktp', 'public'),
                'file_surat_pernyataan' => $request->file('file_surat_pernyataan')->store('data-pendaftaran/surat-pernyataan', 'public'),
            ]);
        });

        // Arahkan kembali ke halaman index (Daftar Antrian/Pendaftaran) setelah sukses
        return redirect()->route('admin-anggota.pendaftaran-anggota.index');
    }

    // 4. Menampilkan halaman Detail (Show)
    public function show($id)
    {
        $anggota = Anggota::with('dataPendaftaran')->findOrFail($id);

        return Inertia::render('AdminAnggota/PendaftaranAnggota/Show', [
            'anggota' => $anggota
        ]);
    }

    // 5. Menampilkan halaman form Edit
    public function edit($id)
    {
        $anggota = Anggota::findOrFail($id);
        
        return Inertia::render('AdminAnggota/PendaftaranAnggota/Edit', [
            'anggota' => $anggota
        ]);
    }

    // 6. Memproses update data ke database
    public function update(Request $request, $id)
    {
        // Validasi inputan update
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'alamat' => 'required|string',
            'no_telepon' => 'nullable|string|max:15',
        ]);

        $anggota = Anggota::findOrFail($id);
        $anggota->update($validated);

        return redirect()->route('admin-anggota.pendaftaran-anggota.index');
    }
}