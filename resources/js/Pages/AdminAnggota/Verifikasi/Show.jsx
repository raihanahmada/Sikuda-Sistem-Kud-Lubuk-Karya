import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { ArrowLeft, CheckCircle2, XCircle, FileText } from 'lucide-react';

// ===== PENERAPAN MATERI: Component Parent-Child (Pertemuan 2) =====
// DokumenPreview adalah child component yang menerima props label dan url
function DokumenPreview({ label, url }) {
    if (!url) {
        return (
            <div>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">{label}</p>
                <div className="w-full h-32 flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-400 dark:text-gray-500 italic">
                    Belum diunggah
                </div>
            </div>
        );
    }

    const isPdf = url.toLowerCase().endsWith('.pdf');

    return (
        <div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">{label}</p>
            {isPdf ? (
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-32 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-[#1B8A3A] hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-base transition"
                >
                    <FileText size={18} />
                    Lihat PDF
                </a>
            ) : (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={label} className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700 hover:opacity-80 transition" />
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

    if (!anggota) return <div className="text-base text-gray-500 dark:text-gray-400">Data tidak ditemukan</div>;

    return (
        <AdminAnggotaLayout title="Detail Verifikasi">
            <Head title="Detail Verifikasi" />

            {/* ===== PENERAPAN MATERI: Dynamic Route (Pertemuan 11) =====
                URL halaman ini: /admin-anggota/verifikasi/{id_anggota}
                id_anggota bersifat dinamis — berbeda tiap anggota yang dibuka
                Data anggota yang ditampilkan otomatis sesuai ID di URL
                (dikirim dari VerifikasiController::show($id) ke props 'anggota')
            ===== AKHIR DYNAMIC ROUTE ===== */}
            <div className="flex items-center gap-3 mb-5">
                <Link href="/admin-anggota/verifikasi" className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Detail Verifikasi</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500">ID Pengajuan #{anggota.id_anggota}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* DATA CALON ANGGOTA */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Data Calon Anggota</h2>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400">
                            {anggota.status_keanggotaan}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Nama Lengkap</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.nama_lengkap}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">NIK</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.nik}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Nomor HP</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.no_telepon || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Nomor Surat Permohonan</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.no_surat_permohonan || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Tanggal Pendaftaran</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.tanggal_daftar}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 dark:text-gray-500 mb-1">Alamat</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.alamat}</p>
                        </div>
                    </div>
                </div>

                {/* PANEL AKSI */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-fit">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-5">Aksi Verifikasi</h2>

                    {!tampilFormTolak ? (
                        <div className="space-y-2.5">
                            <button onClick={handleTerima}
                                className="w-full flex items-center justify-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white py-3 rounded-xl text-base font-semibold transition"
                            >
                                <CheckCircle2 size={18} />
                                Terima Pengajuan
                            </button>
                            <button onClick={() => setTampilFormTolak(true)}
                                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-base font-semibold transition"
                            >
                                <XCircle size={18} />
                                Tolak Pengajuan
                            </button>
                            <Link href="/admin-anggota/verifikasi"
                                className="block text-center py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-base font-medium text-gray-600 dark:text-gray-300 transition"
                            >
                                Kembali
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleTolakSubmit} className="space-y-4">
                            <div>
                                <label className="block text-base font-medium text-gray-600 dark:text-gray-300 mb-1.5">Masukkan Alasan Penolakan:</label>
                                <textarea
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                                    rows="3"
                                    placeholder="Syarat tidak lengkap..."
                                    value={data.alasan_penolakan}
                                    onChange={e => setData('alasan_penolakan', e.target.value)}
                                    required
                                />
                                {errors.alasan_penolakan && <div className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.alasan_penolakan}</div>}
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={processing}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70"
                                >
                                    Konfirmasi Tolak
                                </button>
                                <button type="button" onClick={() => setTampilFormTolak(false)}
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-base font-semibold transition"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* DOKUMEN PERSYARATAN */}
            <div className="mt-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Dokumen Persyaratan</h2>
                {/* ===== PENERAPAN MATERI: Parent memanggil Child Component DokumenPreview (Pertemuan 2) ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <DokumenPreview label="Kartu Keluarga (KK)" url={anggota.data_pendaftaran?.file_kk_url} />
                    <DokumenPreview label="KTP" url={anggota.data_pendaftaran?.file_ktp_url} />
                    <DokumenPreview label="Surat Pernyataan" url={anggota.data_pendaftaran?.file_surat_pernyataan_url} />
                </div>
                {/* ================================================================ */}
            </div>

        </AdminAnggotaLayout>
    );
}
