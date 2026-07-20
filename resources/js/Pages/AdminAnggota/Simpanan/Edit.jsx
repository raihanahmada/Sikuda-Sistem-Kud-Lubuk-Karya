import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ simpanan }) {
    const { data, setData, put, processing, errors } = useForm({
        jenis_simpanan: simpanan.jenis_simpanan,
        jumlah: simpanan.jumlah,
        tanggal_transaksi: simpanan.tanggal_transaksi,
        keterangan: simpanan.keterangan || '',
    });

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    // Jenis: Dependency Array Kosong []
    // Fungsi: dijalankan sekali saat form edit simpanan pertama kali dibuka
    // Mengubah judul tab browser sesuai nama anggota yang sedang diedit
    useEffect(() => {
        if (simpanan?.anggota) {
            document.title = `Edit Simpanan — ${simpanan.anggota.nama_lengkap}`;
        }
        return () => {
            document.title = 'SIKUDA';
        };
    }, []);
    // ===== AKHIR PENERAPAN useEffect =====

    function submit(e) {
        e.preventDefault();
        put(`/admin-anggota/simpanan/${simpanan.id_simpanan}`);
    }

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500";
    const labelCls = "block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300";

    return (
        <AdminAnggotaLayout title="Edit Transaksi Simpanan">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <Link href={`/admin-anggota/simpanan/${simpanan.id_anggota}`} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-gray-800">
                    <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Koreksi Data Transaksi</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500">KUD Lubuk Karya</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto dark:bg-gray-900 dark:border-gray-800">
                <form onSubmit={submit} className="space-y-4">

                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl dark:bg-gray-800 dark:border-gray-700">
                        <p className="text-base text-gray-600 dark:text-gray-300">Anggota: <span className="font-semibold text-gray-800 dark:text-gray-100">{simpanan.anggota.nama_lengkap}</span></p>
                    </div>

                    <div>
                        <label className={labelCls}>Jenis Transaksi</label>
                        <select
                            className={`${inputCls} bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400`}
                            value={data.jenis_simpanan}
                            onChange={e => setData('jenis_simpanan', e.target.value)}
                            disabled={true}
                        >
                            <option value="wajib">Simpanan Wajib</option>
                            <option value="pokok">Simpanan Pokok</option>
                            <option value="pengambilan">Pengambilan / Penarikan</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelCls}>Jumlah (Rp)</label>
                        <input type="number" className={inputCls} value={data.jumlah} onChange={e => setData('jumlah', e.target.value)} />
                        {errors.jumlah && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{errors.jumlah}</div>}
                    </div>

                    <div>
                        <label className={labelCls}>Tanggal Transaksi</label>
                        <input type="date" className={inputCls} value={data.tanggal_transaksi} onChange={e => setData('tanggal_transaksi', e.target.value)} />
                    </div>

                    <div>
                        <label className={labelCls}>Keterangan</label>
                        <textarea rows="3" className={inputCls} value={data.keterangan} onChange={e => setData('keterangan', e.target.value)} />
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100 dark:border-gray-800">
                        <button disabled={processing} className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                            <Save size={18} />
                            Update
                        </button>
                        <Link href={`/admin-anggota/simpanan/${simpanan.id_anggota}`} className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-base font-semibold transition dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminAnggotaLayout>
    );
}
