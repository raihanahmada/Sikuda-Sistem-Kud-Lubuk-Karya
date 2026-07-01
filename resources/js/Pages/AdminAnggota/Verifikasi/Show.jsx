import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';

// ===== PENERAPAN MATERI: Component Parent-Child (Pertemuan 2) =====
// DokumenPreview adalah child component yang menerima props label dan url
function DokumenPreview({ label, url }) {
    if (!url) {
        return (
            <div>
                <p className="text-sm text-gray-500 mb-2">{label}</p>
                <div className="w-full h-32 flex items-center justify-center border border-dashed rounded-lg text-sm text-gray-400 italic">
                    Belum diunggah
                </div>
            </div>
        );
    }

    const isPdf = url.toLowerCase().endsWith('.pdf');

    return (
        <div>
            <p className="text-sm text-gray-500 mb-2">{label}</p>
            {isPdf ? (
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full h-32 border rounded-lg bg-gray-50 text-blue-600 hover:bg-gray-100 font-medium"
                >
                    📄 Lihat PDF
                </a>
            ) : (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={label} className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition" />
                </a>
            )}
        </div>
    );
}
// ===== AKHIR CHILD COMPONENT =====

export default function Show({ anggota }) {
    const [tampilFormTolak, setTampilFormTolak] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        alasan_penolakan: ''
    });

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    // Jenis: Dengan Dependency Array Kosong []
    // Fungsi: menjalankan sesuatu sekali saat halaman detail pertama kali dibuka
    // Contoh nyata: log/catat bahwa halaman detail anggota ini sedang dibuka
    // (sesuai konsep "menjalankan sesuatu setelah komponen muncul" dari modul)
    useEffect(() => {
        if (anggota) {
            document.title = `Detail Verifikasi — ${anggota.nama_lengkap}`;
        }
        // cleanup: kembalikan title ke semula saat halaman ditinggalkan
        return () => {
            document.title = 'SIKUDA';
        };
    }, []); // dependency array kosong = jalankan sekali saat mount
    // ===== AKHIR PENERAPAN useEffect =====

    const handleTerima = () => {
        if (confirm('Yakin ingin MENERIMA anggota ini? Sistem akan otomatis mencatat Simpanan Pokok sesuai SKPL.')) {
            router.put(`/admin-anggota/verifikasi/${anggota.id_anggota}/terima`);
        }
    };

    const handleTolakSubmit = (e) => {
        e.preventDefault();
        put(`/admin-anggota/verifikasi/${anggota.id_anggota}/tolak`);
    };

    if (!anggota) return <div>Data tidak ditemukan</div>;

    return (
        <AdminAnggotaLayout title="Detail Verifikasi">
            <Head title="Detail Verifikasi" />

            {/* ===== PENERAPAN MATERI: Dynamic Route (Pertemuan 11) =====
                URL halaman ini: /admin-anggota/verifikasi/{id_anggota}
                id_anggota bersifat dinamis — berbeda tiap anggota yang dibuka
                Data anggota yang ditampilkan otomatis sesuai ID di URL
                (dikirim dari VerifikasiController::show($id) ke props 'anggota')
            ===== AKHIR DYNAMIC ROUTE ===== */}
            <div className="mb-6">
                <p className="text-sm text-gray-500">ID Pengajuan #{anggota.id_anggota}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* DATA CALON ANGGOTA */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Data Calon Anggota</h2>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            {anggota.status_keanggotaan}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Nama Lengkap</label>
                            <p className="font-medium text-gray-800">{anggota.nama_lengkap}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">NIK</label>
                            <p className="font-medium text-gray-800">{anggota.nik}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Nomor HP</label>
                            <p className="font-medium text-gray-800">{anggota.no_telepon || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Nomor Surat Permohonan</label>
                            <p className="font-medium text-gray-800">{anggota.no_surat_permohonan || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-500 mb-1">Tanggal Pendaftaran</label>
                            <p className="font-medium text-gray-800">{anggota.tanggal_daftar}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-500 mb-1">Alamat</label>
                            <p className="font-medium text-gray-800">{anggota.alamat}</p>
                        </div>
                    </div>
                </div>

                {/* PANEL AKSI */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Aksi Verifikasi</h2>
                    
                    {!tampilFormTolak ? (
                        <div className="space-y-3">
                            <button onClick={handleTerima}
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition"
                            >
                                ✓ Terima Pengajuan
                            </button>
                            <button onClick={() => setTampilFormTolak(true)}
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition"
                            >
                                ✕ Tolak Pengajuan
                            </button>
                            <Link href="/admin-anggota/verifikasi"
                                className="block text-center py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                            >
                                Kembali
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleTolakSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Masukkan Alasan Penolakan:</label>
                                <textarea
                                    className="w-full border p-3 rounded-xl"
                                    rows="3"
                                    placeholder="Syarat tidak lengkap..."
                                    value={data.alasan_penolakan}
                                    onChange={e => setData('alasan_penolakan', e.target.value)}
                                    required
                                />
                                {errors.alasan_penolakan && <div className="text-red-500 text-sm mt-1">{errors.alasan_penolakan}</div>}
                            </div>
                            <div className="flex space-x-2">
                                <button type="submit" disabled={processing}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-medium"
                                >
                                    Konfirmasi Tolak
                                </button>
                                <button type="button" onClick={() => setTampilFormTolak(false)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 py-2 rounded-xl font-medium"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* DOKUMEN PERSYARATAN */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Dokumen Persyaratan</h2>
                {/* ===== PENERAPAN MATERI: Parent memanggil Child Component DokumenPreview (Pertemuan 2) ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DokumenPreview label="Kartu Keluarga (KK)" url={anggota.data_pendaftaran?.file_kk_url} />
                    <DokumenPreview label="KTP" url={anggota.data_pendaftaran?.file_ktp_url} />
                    <DokumenPreview label="Surat Pernyataan" url={anggota.data_pendaftaran?.file_surat_pernyataan_url} />
                </div>
                {/* ================================================================ */}
            </div>

        </AdminAnggotaLayout>
    );
}