import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm } from '@inertiajs/react';

export default function Create() {

    const { data, setData, post, processing, errors } = useForm({
        nik: '',
        nama_lengkap: '',
        alamat: '',
        no_telepon: '',
        tanggal_daftar: '',
    });

    function submit(e) {
        e.preventDefault();

        post('/admin-anggota/pendaftaran-anggota');
    }

    return (
        <AdminAnggotaLayout title="Tambah Anggota">

            <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow space-y-4">

                <h2 className="text-xl font-bold">Form Pendaftaran Anggota</h2>

                {/* NIK */}
                <div>
                    <input
                        type="text"
                        placeholder="NIK"
                        className="border p-2 w-full"
                        value={data.nik}
                        onChange={e => setData('nik', e.target.value)}
                    />
                    {errors.nik && <div className="text-red-500 text-sm">{errors.nik}</div>}
                </div>

                {/* Nama */}
                <div>
                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        className="border p-2 w-full"
                        value={data.nama_lengkap}
                        onChange={e => setData('nama_lengkap', e.target.value)}
                    />
                    {errors.nama_lengkap && <div className="text-red-500 text-sm">{errors.nama_lengkap}</div>}
                </div>

                {/* Alamat */}
                <div>
                    <textarea
                        placeholder="Alamat"
                        className="border p-2 w-full"
                        value={data.alamat}
                        onChange={e => setData('alamat', e.target.value)}
                    />
                    {errors.alamat && <div className="text-red-500 text-sm">{errors.alamat}</div>}
                </div>

                {/* No Telepon */}
                <div>
                    <input
                        type="text"
                        placeholder="No Telepon"
                        className="border p-2 w-full"
                        value={data.no_telepon}
                        onChange={e => setData('no_telepon', e.target.value)}
                    />
                </div>

                {/* Tanggal Daftar */}
                <div>
                    <input
                        type="date"
                        className="border p-2 w-full"
                        value={data.tanggal_daftar}
                        onChange={e => setData('tanggal_daftar', e.target.value)}
                    />
                    {errors.tanggal_daftar && <div className="text-red-500 text-sm">{errors.tanggal_daftar}</div>}
                </div>

                {/* Button */}
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