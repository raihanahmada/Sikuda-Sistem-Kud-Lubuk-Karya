import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField'; // ===== PENERAPAN MATERI: import Reusable Component =====
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ anggota }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_lengkap: anggota.nama_lengkap || '',
        alamat: anggota.alamat || '',
        no_telepon: anggota.no_telepon || '',
    });

    function submit(e) {
        e.preventDefault();
        put(`/admin-anggota/pendaftaran-anggota/${anggota.id_anggota}`);
    }

    return (
        <AdminAnggotaLayout title="Edit Anggota">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <Link href="/admin-anggota/pendaftaran-anggota" className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Edit Data Pendaftaran</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
            </div>

            <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                {/* ===== PENERAPAN MATERI: Memanggil Reusable Component InputField ===== */}
                <InputField
                    label="Nama Lengkap"
                    value={data.nama_lengkap}
                    onChange={e => setData('nama_lengkap', e.target.value)}
                    error={errors.nama_lengkap}
                />
                {/* ================================================================ */}

                <div>
                    <label className="block text-base font-medium text-gray-600 mb-1.5">Alamat</label>
                    <textarea
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                        rows="3"
                        value={data.alamat}
                        onChange={e => setData('alamat', e.target.value)}
                    />
                    {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                </div>

                {/* ===== PENERAPAN MATERI: Memanggil Reusable Component InputField ===== */}
                <InputField
                    label="No Telepon"
                    value={data.no_telepon}
                    onChange={e => setData('no_telepon', e.target.value)}
                    error={errors.no_telepon}
                />
                {/* ================================================================ */}

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        disabled={processing}
                        className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70"
                    >
                        <Save size={18} />
                        Update Data
                    </button>

                    <Link
                        href="/admin-anggota/pendaftaran-anggota"
                        className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-base font-semibold transition"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminAnggotaLayout>
    );
}
