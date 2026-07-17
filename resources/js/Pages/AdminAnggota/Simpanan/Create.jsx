import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create({ daftarAnggota = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        id_anggota: '',
        jenis_simpanan: 'wajib',
        jumlah: '',
        tanggal_transaksi: '',
        keterangan: '',
    });

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    // Jenis: Dependency Array Kosong []
    // Fungsi: dijalankan sekali saat form tambah simpanan pertama kali dibuka
    // Sesuai konsep "menjalankan sesuatu setelah komponen muncul" dari modul
    useEffect(() => {
        document.title = 'Tambah Transaksi Simpanan — SIKUDA';
        return () => {
            document.title = 'SIKUDA';
        };
    }, []);
    // ===== AKHIR PENERAPAN useEffect =====

    function submit(e) {
        e.preventDefault();
        post('/admin-anggota/simpanan');
    }

    const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]";
    const labelCls = "block text-base font-medium text-gray-600 mb-1.5";

    return (
        <AdminAnggotaLayout title="Tambah Simpanan">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <Link href="/admin-anggota/simpanan" className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Input Transaksi Simpanan</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className={labelCls}>Pilih Anggota</label>
                        <select
                            className={inputCls}
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
                        {errors.id_anggota && <div className="text-red-500 text-sm mt-1">{errors.id_anggota}</div>}
                    </div>

                    <div>
                        <label className={labelCls}>Jenis Transaksi</label>
                        <select
                            className={inputCls}
                            value={data.jenis_simpanan}
                            onChange={e => setData('jenis_simpanan', e.target.value)}
                        >
                            <option value="wajib">Simpanan Wajib</option>
                            <option value="pokok">Simpanan Pokok</option>
                            <option value="pengambilan">Pengambilan / Penarikan</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelCls}>Jumlah (Rp)</label>
                        <input
                            type="number"
                            placeholder="Contoh: 50000"
                            className={inputCls}
                            value={data.jumlah}
                            onChange={e => setData('jumlah', e.target.value)}
                        />
                        {errors.jumlah && <div className="text-red-500 text-sm mt-1">{errors.jumlah}</div>}
                    </div>

                    <div>
                        <label className={labelCls}>Tanggal Transaksi</label>
                        <input
                            type="date"
                            className={inputCls}
                            value={data.tanggal_transaksi}
                            onChange={e => setData('tanggal_transaksi', e.target.value)}
                        />
                        {errors.tanggal_transaksi && <div className="text-red-500 text-sm mt-1">{errors.tanggal_transaksi}</div>}
                    </div>

                    <div>
                        <label className={labelCls}>Keterangan (Opsional)</label>
                        <textarea
                            placeholder="Catatan tambahan..."
                            rows="3"
                            className={inputCls}
                            value={data.keterangan}
                            onChange={e => setData('keterangan', e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100">
                        <button disabled={processing} className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                            <Save size={18} />
                            Simpan Transaksi
                        </button>
                        <Link href="/admin-anggota/simpanan" className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-base font-semibold transition">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AdminAnggotaLayout>
    );
}
