import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';

export default function Edit({ simpanan }) {
    const { data, setData, put, processing, errors } = useForm({
        jenis_simpanan: simpanan.jenis_simpanan,
        jumlah: simpanan.jumlah,
        tanggal_transaksi: simpanan.tanggal_transaksi,
        keterangan: simpanan.keterangan || '',
    });

    function submit(e) {
        e.preventDefault();
        put(`/admin-anggota/simpanan/${simpanan.id_simpanan}`);
    }

    return (
        <AdminAnggotaLayout title="Edit Transaksi Simpanan">
            <div className="bg-white p-6 rounded-xl shadow max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Koreksi Data Transaksi</h2>
                <form onSubmit={submit} className="space-y-4">
                    
                    <div className="bg-gray-100 p-3 rounded mb-4">
                        <p className="text-sm text-gray-600">Anggota: <span className="font-bold text-gray-800">{simpanan.anggota.nama_lengkap}</span></p>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Jenis Transaksi</label>
                        <select 
                            className="border p-2 w-full rounded bg-gray-100" 
                            value={data.jenis_simpanan} 
                            onChange={e => setData('jenis_simpanan', e.target.value)}
                            disabled={true} // KUNCI agar tidak bisa diubah jenis transaksinya
                        >
                            <option value="wajib">Simpanan Wajib</option>
                            <option value="pokok">Simpanan Pokok</option>
                            <option value="pengambilan">Pengambilan / Penarikan</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Jumlah (Rp)</label>
                        <input type="number" className="border p-2 w-full rounded" value={data.jumlah} onChange={e => setData('jumlah', e.target.value)} />
                        {errors.jumlah && <div className="text-red-500 text-sm">{errors.jumlah}</div>}
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Tanggal Transaksi</label>
                        <input type="date" className="border p-2 w-full rounded" value={data.tanggal_transaksi} onChange={e => setData('tanggal_transaksi', e.target.value)} />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Keterangan</label>
                        <textarea className="border p-2 w-full rounded" value={data.keterangan} onChange={e => setData('keterangan', e.target.value)} />
                    </div>

                    <div className="pt-4 flex space-x-2">
                        <button disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">Update</button>
                        <Link href={`/admin-anggota/simpanan/${simpanan.id_anggota}`} className="bg-gray-200 px-5 py-2 rounded-lg flex items-center">Batal</Link>
                    </div>
                </form>
            </div>
        </AdminAnggotaLayout>
    );
}