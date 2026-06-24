import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';

export default function Edit({ anggota }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_lengkap: anggota.nama_lengkap || '',
        alamat: anggota.alamat || '',
        no_telepon: anggota.no_telepon || '',
        status_keanggotaan: anggota.status_keanggotaan || 'aktif',
    });

    function submit(e) {
        e.preventDefault();
        put(`/admin-anggota/data-anggota/${anggota.id_anggota}`);
    }

    return (
        <AdminAnggotaLayout title="Edit Data Anggota">
            <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Edit Data & Status Anggota</h2>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* NIK (Readonly, karena NIK tidak boleh sembarangan diubah) */}
                    <div>
                        <label className="block mb-1 font-semibold text-gray-600">NIK (Nomor Induk Kependudukan)</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                            value={anggota.nik}
                            disabled
                        />
                    </div>

                    {/* Status Keanggotaan */}
                    <div>
                        <label className="block mb-1 font-semibold">Status Keanggotaan</label>
                        <select
                            className="border p-2 w-full rounded focus:ring-green-500 focus:border-green-500"
                            value={data.status_keanggotaan}
                            onChange={e => setData('status_keanggotaan', e.target.value)}
                        >
                            <option value="aktif">Aktif</option>
                            <option value="pasif">Pasif</option>
                            <option value="keluar">Keluar</option>
                        </select>
                        {errors.status_keanggotaan && <div className="text-red-500 text-sm mt-1">{errors.status_keanggotaan}</div>}
                    </div>

                    {/* Nama Lengkap */}
                    <div className="md:col-span-2">
                        <label className="block mb-1 font-semibold">Nama Lengkap</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded focus:ring-green-500 focus:border-green-500"
                            value={data.nama_lengkap}
                            onChange={e => setData('nama_lengkap', e.target.value)}
                        />
                        {errors.nama_lengkap && <div className="text-red-500 text-sm mt-1">{errors.nama_lengkap}</div>}
                    </div>

                    {/* Alamat */}
                    <div className="md:col-span-2">
                        <label className="block mb-1 font-semibold">Alamat</label>
                        <textarea
                            className="border p-2 w-full rounded focus:ring-green-500 focus:border-green-500"
                            rows="3"
                            value={data.alamat}
                            onChange={e => setData('alamat', e.target.value)}
                        />
                        {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                    </div>

                    {/* No Telepon */}
                    <div className="md:col-span-2">
                        <label className="block mb-1 font-semibold">No Telepon</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded focus:ring-green-500 focus:border-green-500"
                            value={data.no_telepon}
                            onChange={e => setData('no_telepon', e.target.value)}
                        />
                        {errors.no_telepon && <div className="text-red-500 text-sm mt-1">{errors.no_telepon}</div>}
                    </div>
                </div>

                <div className="flex space-x-3 pt-6">
                    <button 
                        disabled={processing} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
                    >
                        Simpan Perubahan
                    </button>
                    
                    <Link 
                        href="/admin-anggota/data-anggota" 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg flex items-center font-medium transition"
                    >
                        Batal
                    </Link>
                </div>
            </form>
        </AdminAnggotaLayout>
    );
}