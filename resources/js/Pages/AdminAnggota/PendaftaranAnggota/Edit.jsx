import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField'; // ===== PENERAPAN MATERI: import Reusable Component =====

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
            <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-xl font-bold mb-4">Edit Data Pendaftaran</h2>

                {/* ===== PENERAPAN MATERI: Memanggil Reusable Component InputField ===== */}
                <InputField
                    label="Nama Lengkap"
                    value={data.nama_lengkap}
                    onChange={e => setData('nama_lengkap', e.target.value)}
                    error={errors.nama_lengkap}
                />
                {/* ================================================================ */}

                <div>
                    <label className="block mb-1 font-semibold">Alamat</label>
                    <textarea
                        className="border p-2 w-full rounded"
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

                <div className="flex space-x-3 pt-4">
                    <button 
                        disabled={processing} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Update Data
                    </button>
                    
                    <Link 
                        href="/admin-anggota/pendaftaran-anggota" 
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminAnggotaLayout>
    );
}