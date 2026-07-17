import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { History, Save, PiggyBank } from 'lucide-react';
import ModalShell from './ModalShell';
import SimpananFormFields from './SimpananFormFields';

const formatRp = (angka) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
}).format(angka);

// anggota: baris rekapSimpanan yang sedang dibuka (sudah termasuk `riwayat`),
// selalu diturunkan langsung dari props Index (bukan salinan) supaya begitu
// edit riwayat sukses & Inertia menyegarkan props, isi modal ikut ter-update.
export default function ModalDetailSimpanan({ anggota, onTutup }) {
    const [editingItem, setEditingItem] = useState(null);

    const form = useForm({
        jenis_simpanan: editingItem?.jenis_simpanan ?? 'wajib',
        jumlah: editingItem?.jumlah ?? '',
        tanggal_transaksi: editingItem?.tanggal_transaksi ?? '',
        keterangan: editingItem?.keterangan ?? '',
    });

    const mulaiEdit = (item) => {
        form.clearErrors();
        form.setData({
            jenis_simpanan: item.jenis_simpanan,
            jumlah: item.jumlah,
            tanggal_transaksi: item.tanggal_transaksi,
            keterangan: item.keterangan || '',
        });
        setEditingItem(item);
    };

    const simpanEdit = (e) => {
        e.preventDefault();
        form.put(route('admin-anggota.simpanan.update', editingItem.id_simpanan), {
            preserveScroll: true,
            onSuccess: () => setEditingItem(null),
        });
    };

    return (
        <ModalShell
            title={editingItem ? 'Koreksi Data Transaksi' : 'Detail Simpanan'}
            subtitle={anggota.nama_lengkap}
            icon={PiggyBank}
            onTutup={onTutup}
            maxWidth="max-w-3xl"
        >
            {editingItem ? (
                <form onSubmit={simpanEdit} className="space-y-4">
                    <div className="bg-white border border-emerald-200 shadow-sm p-3 rounded-xl">
                        <p className="text-base text-gray-600">Anggota: <span className="font-semibold text-gray-800">{anggota.nama_lengkap}</span></p>
                    </div>
                    <SimpananFormFields data={form.data} setData={form.setData} errors={form.errors} />
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setEditingItem(null)} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition">
                            Batal
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                            <Save size={18} />
                            {form.processing ? 'Menyimpan…' : 'Update'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    {/* Info Saldo */}
                    <div>
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{anggota.nama_lengkap}</h3>
                                <p className="text-sm text-gray-400 mt-0.5">NIK: {anggota.nik}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400 mb-1">Total Saldo Saat Ini</p>
                                <p className="text-3xl font-bold text-[#1B8A3A]">{formatRp(anggota.saldo)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl p-4 text-center">
                                <p className="text-sm text-gray-500 mb-1">Total Pokok</p>
                                <p className="text-lg font-semibold text-[#1B8A3A]">{formatRp(anggota.pokok)}</p>
                            </div>
                            <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl p-4 text-center">
                                <p className="text-sm text-gray-500 mb-1">Total Wajib</p>
                                <p className="text-lg font-semibold text-[#1B8A3A]">{formatRp(anggota.wajib)}</p>
                            </div>
                            <div className="bg-white border border-red-200 shadow-sm rounded-2xl p-4 text-center">
                                <p className="text-sm text-red-400 mb-1">Total Pengambilan</p>
                                <p className="text-lg font-semibold text-red-600">{formatRp(anggota.pengambilan)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabel Riwayat */}
                    <div className="border border-emerald-200 shadow-sm rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-emerald-200 bg-emerald-100/70">
                            <h3 className="text-base font-semibold text-emerald-900">Riwayat Transaksi</h3>
                        </div>
                        {anggota.riwayat.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 text-gray-300">
                                <History size={32} className="mb-2" />
                                <p className="text-base italic">Belum ada riwayat transaksi.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-base">
                                    <thead>
                                        <tr className="border-b border-emerald-200 bg-emerald-50/70">
                                            <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Tanggal</th>
                                            <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Jenis</th>
                                            <th className="text-right text-sm text-emerald-800 font-semibold px-4 py-3">Jumlah</th>
                                            <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Keterangan</th>
                                            <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {anggota.riwayat.map((item) => (
                                            <tr key={item.id_simpanan} className="border-b border-emerald-100 hover:bg-emerald-50 transition">
                                                <td className="px-4 py-3 text-gray-500">{item.tanggal_transaksi}</td>
                                                <td className="px-4 py-3 text-sm uppercase font-semibold text-gray-500">{item.jenis_simpanan}</td>
                                                <td className={`px-4 py-3 text-right font-semibold ${item.jenis_simpanan === 'pengambilan' ? 'text-red-500' : 'text-[#1B8A3A]'}`}>
                                                    {item.jenis_simpanan === 'pengambilan' ? '-' : '+'}{formatRp(item.jumlah)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{item.keterangan || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <button onClick={() => mulaiEdit(item)}
                                                            className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition">
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={onTutup} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition">
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </ModalShell>
    );
}
