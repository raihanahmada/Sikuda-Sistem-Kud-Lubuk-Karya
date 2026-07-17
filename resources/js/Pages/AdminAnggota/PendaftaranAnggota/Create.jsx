import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField'; // ===== PENERAPAN MATERI: import Reusable Component =====
import { ArrowLeft, AlertTriangle, UploadCloud, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nik: '',
        nama_lengkap: '',
        alamat: '',
        no_telepon: '',
        tanggal_daftar: '',
        file_kk: null,
        file_ktp: null,
        file_surat_pernyataan: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/admin-anggota/pendaftaran-anggota');
    }

    return (
        <AdminAnggotaLayout title="Tambah Anggota">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <Link href="/admin-anggota/pendaftaran-anggota" className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Form Pendaftaran Anggota</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
            </div>

            <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                {/* ===== PENERAPAN MATERI: Memanggil Reusable Component InputField ===== */}
                <InputField
                    label="NIK"
                    placeholder="NIK"
                    value={data.nik}
                    onChange={e => setData('nik', e.target.value)}
                    error={errors.nik}
                />

                <InputField
                    label="Nama Lengkap"
                    placeholder="Nama Lengkap"
                    value={data.nama_lengkap}
                    onChange={e => setData('nama_lengkap', e.target.value)}
                    error={errors.nama_lengkap}
                />
                {/* ================================================================ */}

                {/* Alamat tetap pakai textarea biasa, karena InputField hanya untuk <input> */}
                <div>
                    <label className="block text-base font-medium text-gray-600 mb-1.5">Alamat</label>
                    <textarea
                        placeholder="Alamat"
                        rows="3"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                        value={data.alamat}
                        onChange={e => setData('alamat', e.target.value)}
                    />
                    {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                </div>

                {/* ===== PENERAPAN MATERI: Memanggil Reusable Component InputField ===== */}
                <InputField
                    label="No Telepon"
                    placeholder="No Telepon"
                    value={data.no_telepon}
                    onChange={e => setData('no_telepon', e.target.value)}
                />

                <InputField
                    label="Tanggal Daftar"
                    type="date"
                    value={data.tanggal_daftar}
                    onChange={e => setData('tanggal_daftar', e.target.value)}
                    error={errors.tanggal_daftar}
                />
                {/* ================================================================ */}

                {/* Dokumen Persyaratan (tetap input type="file", karena InputField tidak menangani file) */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                    <div>
                        <label className="block text-base font-medium text-gray-600 mb-1.5">File Kartu Keluarga (KK)</label>
                        <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-gray-50 hover:border-[#1B8A3A]/40 transition">
                            <UploadCloud size={20} className="text-gray-400" />
                            <span className="text-sm text-gray-500 truncate max-w-full">{data.file_kk ? data.file_kk.name : 'Pilih file'}</span>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={e => setData('file_kk', e.target.files[0])}
                            />
                        </label>
                        {errors.file_kk && <div className="text-red-500 text-sm mt-1">{errors.file_kk}</div>}
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-600 mb-1.5">File KTP</label>
                        <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-gray-50 hover:border-[#1B8A3A]/40 transition">
                            <UploadCloud size={20} className="text-gray-400" />
                            <span className="text-sm text-gray-500 truncate max-w-full">{data.file_ktp ? data.file_ktp.name : 'Pilih file'}</span>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={e => setData('file_ktp', e.target.files[0])}
                            />
                        </label>
                        {errors.file_ktp && <div className="text-red-500 text-sm mt-1">{errors.file_ktp}</div>}
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-600 mb-1.5">File Surat Pernyataan</label>
                        <label className="flex flex-col items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-xl px-3 py-4 text-center cursor-pointer hover:bg-gray-50 hover:border-[#1B8A3A]/40 transition">
                            <UploadCloud size={20} className="text-gray-400" />
                            <span className="text-sm text-gray-500 truncate max-w-full">{data.file_surat_pernyataan ? data.file_surat_pernyataan.name : 'Pilih file'}</span>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={e => setData('file_surat_pernyataan', e.target.files[0])}
                            />
                        </label>
                        {errors.file_surat_pernyataan && <div className="text-red-500 text-sm mt-1">{errors.file_surat_pernyataan}</div>}
                        <p className="text-sm text-gray-400 mt-1">Format: JPG, PNG, atau PDF. Maks 5MB.</p>
                    </div>
                </div>

                {/* ===== PENERAPAN MATERI: Conditional Rendering (Pertemuan 3) ===== */}
                {data.nik && data.nik.length !== 16 ? (
                    <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-base rounded-xl">
                        <AlertTriangle size={18} className="shrink-0" />
                        NIK harus terdiri dari 16 digit angka.
                    </div>
                ) : null}
                {/* ================================================================ */}

                <div className="pt-2 border-t border-gray-100">
                    <button
                        disabled={processing}
                        className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70 mt-4"
                    >
                        <Save size={18} />
                        Simpan
                    </button>
                </div>
            </form>
        </AdminAnggotaLayout>
    );
}
