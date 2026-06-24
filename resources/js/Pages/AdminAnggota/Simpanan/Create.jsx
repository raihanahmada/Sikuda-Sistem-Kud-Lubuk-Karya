import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';

export default function Create({ daftarAnggota = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        id_anggota: '',
        jenis_simpanan: 'wajib',
        jumlah: '',
        tanggal_transaksi: '',
        keterangan: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/admin-anggota/simpanan');
    }

    return (
        <AdminAnggotaLayout title="Tambah Simpanan">
            <div className="bg-white p-6 rounded-xl shadow max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-6 border-b pb-2">Input Transaksi Simpanan</h2>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-1">Pilih Anggota</label>
                        <select
                            className="border p-2 w-full rounded focus:ring-green-500"
                            value={data.id_anggota}
                            onChange={e => setData('id_anggota', e.target.value)}
                        >
                            <option value="">-- Pilih Anggota --</option>
                            {daftarAnggota.map(a => (
                                <option key={a.id_anggota} value={a.id_anggota}>
                                    {a.nik} - {a.nama_lengkap}
                                </option>
                            ))}
                        </select>
                        {errors.id_anggota && <div className="text-red-500 text-sm">{errors.id_anggota}</div>}
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Jenis Transaksi</label>
                        <select
                            className="border p-2 w-full rounded focus:ring-green-500"
                            value={data.jenis_simpanan}
                            onChange={e => setData('jenis_simpanan', e.target.value)}
                        >
                            <option value="wajib">Simpanan Wajib</option>
                            <option value="pokok">Simpanan Pokok</option>
                            <option value="pengambilan">Pengambilan / Penarikan</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Jumlah (Rp)</label>
                        <input
                            type="number"
                            placeholder="Contoh: 50000"
                            className="border p-2 w-full rounded focus:ring-green-500"
                            value={data.jumlah}
                            onChange={e => setData('jumlah', e.target.value)}
                        />
                        {errors.jumlah && <div className="text-red-500 text-sm">{errors.jumlah}</div>}
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Tanggal Transaksi</label>
                        <input
                            type="date"
                            className="border p-2 w-full rounded focus:ring-green-500"
                            value={data.tanggal_transaksi}
                            onChange={e => setData('tanggal_transaksi', e.target.value)}
                        />
                        {errors.tanggal_transaksi && <div className="text-red-500 text-sm">{errors.tanggal_transaksi}</div>}
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Keterangan (Opsional)</label>
                        <textarea
                            placeholder="Catatan tambahan..."
                            className="border p-2 w-full rounded focus:ring-green-500"
                            value={data.keterangan}
                            onChange={e => setData('keterangan', e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex space-x-2">
                        <button disabled={processing} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium">
                            Simpan Transaksi
                        </button>
                        <Link href="/admin-anggota/simpanan" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-medium flex items-center">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminAnggotaLayout>
    );
}