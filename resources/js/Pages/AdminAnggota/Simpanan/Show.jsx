import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { ArrowLeft, History } from 'lucide-react';

export default function Show({ anggota, riwayat = [], totals = {} }) {

    const formatRp = (angka) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    // Jenis: Dependency Array Kosong []
    // Fungsi: dijalankan sekali saat halaman detail simpanan pertama kali dibuka
    // Mengubah judul tab browser sesuai nama anggota yang sedang dilihat
    // Sesuai konsep Dynamic Route — data tampil sesuai ID anggota di URL
    useEffect(() => {
        if (anggota) {
            document.title = `Detail Simpanan — ${anggota.nama_lengkap}`;
        }
        return () => {
            document.title = 'SIKUDA';
        };
    }, []); // dependency array kosong = jalankan sekali saat mount
    // ===== AKHIR PENERAPAN useEffect =====

    return (
        <AdminAnggotaLayout title="Detail Simpanan">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <Link href="/admin-anggota/simpanan" className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Detail Simpanan</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
            </div>

            <div className="space-y-4">

                {/* Info Saldo */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{anggota.nama_lengkap}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">NIK: {anggota.nik}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400 mb-1">Total Saldo Saat Ini</p>
                            <h3 className="text-3xl font-bold text-[#1B8A3A]">{formatRp(totals.saldo)}</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-center">
                            <p className="text-sm text-gray-500 mb-1">Total Pokok</p>
                            <p className="text-lg font-semibold text-gray-800">{formatRp(totals.pokok)}</p>
                        </div>
                        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-center">
                            <p className="text-sm text-gray-500 mb-1">Total Wajib</p>
                            <p className="text-lg font-semibold text-gray-800">{formatRp(totals.wajib)}</p>
                        </div>
                        <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 text-center">
                            <p className="text-sm text-red-400 mb-1">Total Pengambilan</p>
                            <p className="text-lg font-semibold text-red-600">{formatRp(totals.pengambilan)}</p>
                        </div>
                    </div>
                </div>

                {/* Tabel Riwayat Transaksi */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-base font-semibold text-gray-700">Riwayat Transaksi</h3>
                    </div>
                    {riwayat.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 text-gray-300">
                            <History size={32} className="mb-2" />
                            <p className="text-base italic">Belum ada riwayat transaksi.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-base">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">Tanggal</th>
                                        <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">Jenis</th>
                                        <th className="text-right text-sm text-gray-500 font-semibold px-4 py-3">Jumlah</th>
                                        <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">Keterangan</th>
                                        <th className="text-center text-sm text-gray-500 font-semibold px-4 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riwayat.map(item => (
                                        <tr key={item.id_simpanan} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 text-gray-500">{item.tanggal_transaksi}</td>
                                            <td className="px-4 py-3 text-sm uppercase font-semibold text-gray-500">{item.jenis_simpanan}</td>
                                            <td className={`px-4 py-3 text-right font-semibold ${item.jenis_simpanan === 'pengambilan' ? 'text-red-500' : 'text-[#1B8A3A]'}`}>
                                                {item.jenis_simpanan === 'pengambilan' ? '-' : '+'}{formatRp(item.jumlah)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{item.keterangan || '-'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center">
                                                    <Link
                                                        href={`/admin-anggota/simpanan/${item.id_simpanan}/edit`}
                                                        className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AdminAnggotaLayout>
    );
}
