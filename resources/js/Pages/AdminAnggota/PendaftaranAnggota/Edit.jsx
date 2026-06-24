import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';

// Menangkap props 'anggota' yang dikirim dari PendaftaranController
export default function Edit({ anggota }) {

    // Mengisi nilai awal form dengan data dari database
    const { data, setData, put, processing, errors } = useForm({
        nama_lengkap: anggota.nama_lengkap || '',
        alamat: anggota.alamat || '',
        no_telepon: anggota.no_telepon || '',
    });

    function submit(e) {
        e.preventDefault();
        // Arahkan URL put sesuai primary key id_anggota
        put(`/admin-anggota/pendaftaran-anggota/${anggota.id_anggota}`);
    }

    return (
        <AdminAnggotaLayout title="Edit Anggota">
            <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow space-y-4">
                <h2 className="text-xl font-bold mb-4">Edit Data Pendaftaran</h2>

                {/* Nama Lengkap */}
                <div>
                    <label className="block mb-1 font-semibold">Nama Lengkap</label>
                    <input
                        type="text"
                        className="border p-2 w-full rounded"
                        value={data.nama_lengkap}
                        onChange={e => setData('nama_lengkap', e.target.value)}
                    />
                    {errors.nama_lengkap && <div className="text-red-500 text-sm mt-1">{errors.nama_lengkap}</div>}
                </div>

                {/* Alamat */}
                <div>
                    <label className="block mb-1 font-semibold">Alamat</label>
                    <textarea
                        className="border p-2 w-full rounded"
                        value={data.alamat}
                        onChange={e => setData('alamat', e.target.value)}
                    />
                    {errors.alamat && <div className="text-red-500 text-sm mt-1">{errors.alamat}</div>}
                </div>

                {/* No Telepon */}
                <div>
                    <label className="block mb-1 font-semibold">No Telepon</label>
                    <input
                        type="text"
                        className="border p-2 w-full rounded"
                        value={data.no_telepon}
                        onChange={e => setData('no_telepon', e.target.value)}
                    />
                    {errors.no_telepon && <div className="text-red-500 text-sm mt-1">{errors.no_telepon}</div>}
                </div>

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