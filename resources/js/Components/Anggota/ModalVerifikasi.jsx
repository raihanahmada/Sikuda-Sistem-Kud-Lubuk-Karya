import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import ModalShell from './ModalShell';
import { CheckCircle2, XCircle, FileText, ShieldCheck } from 'lucide-react';

// ===== PENERAPAN MATERI: Component Parent-Child (Pertemuan 2) =====
function DokumenPreview({ label, url }) {
    if (!url) {
        return (
            <div>
                <p className="text-sm text-gray-400 mb-2 dark:text-gray-500">{label}</p>
                <div className="w-full h-32 flex items-center justify-center border border-dashed border-gray-200 rounded-xl text-base text-gray-400 italic dark:border-gray-700 dark:text-gray-500">
                    Belum diunggah
                </div>
            </div>
        );
    }
    const isPdf = url.toLowerCase().endsWith('.pdf');
    return (
        <div>
            <p className="text-sm text-gray-400 mb-2 dark:text-gray-500">{label}</p>
            {isPdf ? (
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-32 border border-emerald-100 rounded-xl bg-emerald-50/40 text-[#1B8A3A] hover:bg-emerald-50 font-medium text-base transition dark:border-emerald-900/30 dark:bg-emerald-900/15 dark:hover:bg-emerald-900/25">
                    <FileText size={18} />
                    Lihat PDF
                </a>
            ) : (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={label} className="w-full h-32 object-cover rounded-xl border border-emerald-100 hover:opacity-80 transition dark:border-emerald-900/30" />
                </a>
            )}
        </div>
    );
}
// ===== AKHIR CHILD COMPONENT =====

export default function ModalVerifikasi({ anggota, onTutup }) {
    const [tampilFormTolak, setTampilFormTolak] = useState(false);
    const [processingTerima, setProcessingTerima] = useState(false);
    const form = useForm({ alasan_penolakan: '' });

    const handleTerima = () => {
        if (!confirm('Yakin ingin MENERIMA anggota ini? Sistem akan otomatis mencatat Simpanan Pokok sesuai SKPL.')) return;
        setProcessingTerima(true);
        router.put(route('admin-anggota.verifikasi.terima', anggota.id_anggota), {}, {
            preserveScroll: true,
            onSuccess: onTutup,
            onFinish: () => setProcessingTerima(false),
        });
    };

    const handleTolakSubmit = (e) => {
        e.preventDefault();
        form.put(route('admin-anggota.verifikasi.tolak', anggota.id_anggota), {
            preserveScroll: true,
            onSuccess: onTutup,
        });
    };

    return (
        <ModalShell title="Detail Verifikasi" subtitle={`ID Pengajuan #${anggota.id_anggota}`} icon={ShieldCheck} onTutup={onTutup} maxWidth="max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* DATA CALON ANGGOTA */}
                <div className="lg:col-span-2 bg-white border border-emerald-200 shadow-sm rounded-2xl p-6 dark:bg-gray-900 dark:border-emerald-900/30">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Data Calon Anggota</h3>
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/15 dark:text-amber-400">
                            {anggota.status_keanggotaan}
                        </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 dark:text-gray-500">Nama Lengkap</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.nama_lengkap}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 dark:text-gray-500">NIK</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.nik}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 dark:text-gray-500">Nomor HP</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.no_telepon || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 dark:text-gray-500">Nomor Surat Permohonan</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.no_surat_permohonan || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 dark:text-gray-500">Tanggal Pendaftaran</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.tanggal_daftar}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1 dark:text-gray-500">Alamat</label>
                            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{anggota.alamat}</p>
                        </div>
                    </div>
                </div>

                {/* PANEL AKSI */}
                <div className="border border-gray-100 rounded-2xl p-6 h-fit dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-800 mb-5 dark:text-gray-100">Aksi Verifikasi</h3>
                    {!tampilFormTolak ? (
                        <div className="space-y-2.5">
                            <button onClick={handleTerima} disabled={processingTerima}
                                className="w-full flex items-center justify-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white py-3 rounded-xl text-base font-semibold transition disabled:opacity-70">
                                <CheckCircle2 size={18} />
                                Terima Pengajuan
                            </button>
                            <button onClick={() => setTampilFormTolak(true)} disabled={processingTerima}
                                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-base font-semibold transition disabled:opacity-70">
                                <XCircle size={18} />
                                Tolak Pengajuan
                            </button>
                            <button type="button" onClick={onTutup}
                                className="block w-full text-center py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-base font-medium text-gray-600 transition dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300">
                                Kembali
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleTolakSubmit} className="space-y-4">
                            <div>
                                <label className="block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300">Masukkan Alasan Penolakan:</label>
                                <textarea
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                                    rows="3"
                                    placeholder="Syarat tidak lengkap..."
                                    value={form.data.alasan_penolakan}
                                    onChange={e => form.setData('alasan_penolakan', e.target.value)}
                                    required
                                />
                                {form.errors.alasan_penolakan && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{form.errors.alasan_penolakan}</div>}
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={form.processing}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                                    Konfirmasi Tolak
                                </button>
                                <button type="button" onClick={() => setTampilFormTolak(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-base font-semibold transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                                    Batal
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* DOKUMEN PERSYARATAN */}
            <div className="mt-4 bg-white border border-emerald-200 shadow-sm rounded-2xl p-6 dark:bg-gray-900 dark:border-emerald-900/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-gray-100">Dokumen Persyaratan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <DokumenPreview label="Kartu Keluarga (KK)" url={anggota.data_pendaftaran?.file_kk_url} />
                    <DokumenPreview label="KTP" url={anggota.data_pendaftaran?.file_ktp_url} />
                    <DokumenPreview label="Surat Pernyataan" url={anggota.data_pendaftaran?.file_surat_pernyataan_url} />
                </div>
            </div>
        </ModalShell>
    );
}
