import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField'; // ===== PENERAPAN MATERI: import Reusable Component =====

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
            <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-xl font-bold">Form Pendaftaran Anggota</h2>

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
                    <textarea
                        placeholder="Alamat"
                        className="border p-2 w-full"
                        value={data.alamat}
                        onChange={e => setData('alamat', e.target.value)}
                    />
                    {errors.alamat && <div className="text-red-500 text-sm">{errors.alamat}</div>}
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
                <div>
                    <label className="block text-sm font-medium mb-1">File Kartu Keluarga (KK)</label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        className="border p-2 w-full"
                        onChange={e => setData('file_kk', e.target.files[0])}
                    />
                    {errors.file_kk && <div className="text-red-500 text-sm">{errors.file_kk}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">File KTP</label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        className="border p-2 w-full"
                        onChange={e => setData('file_ktp', e.target.files[0])}
                    />
                    {errors.file_ktp && <div className="text-red-500 text-sm">{errors.file_ktp}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">File Surat Pernyataan</label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        className="border p-2 w-full"
                        onChange={e => setData('file_surat_pernyataan', e.target.files[0])}
                    />
                    {errors.file_surat_pernyataan && <div className="text-red-500 text-sm">{errors.file_surat_pernyataan}</div>}
                    <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, atau PDF. Maks 5MB.</p>
                </div>

                {/* ===== PENERAPAN MATERI: Conditional Rendering (Pertemuan 3) ===== */}
                {data.nik && data.nik.length !== 16 ? (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 text-sm rounded">
                        NIK harus terdiri dari 16 digit angka.
                    </div>
                ) : null}
                {/* ================================================================ */}

                <button
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    Simpan
                </button>
            </form>
        </AdminAnggotaLayout>
    );
}