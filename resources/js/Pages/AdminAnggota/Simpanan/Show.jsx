import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';

export default function Show({ anggota, riwayat = [], totals = {} }) {
    const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    return (
        <AdminAnggotaLayout title="Detail Simpanan">
            <div className="space-y-6">
                
                {/* Info Saldo */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{anggota.nama_lengkap}</h2>
                            <p className="text-gray-500">NIK: {anggota.nik}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total Saldo Saat Ini</p>
                            <h3 className="text-3xl font-bold text-green-600">{formatRp(totals.saldo)}</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Pokok</p>
                            <p className="font-semibold">{formatRp(totals.pokok)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Total Wajib</p>
                            <p className="font-semibold">{formatRp(totals.wajib)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-400">Total Pengambilan</p>
                            <p className="font-semibold text-red-600">{formatRp(totals.pengambilan)}</p>
                        </div>
                    </div>
                </div>

                {/* Tabel Riwayat Transaksi (Sesuai SKPL) */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-bold mb-4">Riwayat Transaksi</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-3 text-left">Tanggal</th>
                                    <th className="border p-3 text-left">Jenis</th>
                                    <th className="border p-3 text-right">Jumlah</th>
                                    <th className="border p-3 text-left">Keterangan</th>
                                    <th className="border p-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riwayat.length > 0 ? riwayat.map(item => (
                                    <tr key={item.id_simpanan} className="hover:bg-gray-50">
                                        <td className="border p-3">{item.tanggal_transaksi}</td>
                                        <td className="border p-3 uppercase text-xs font-bold text-gray-600">{item.jenis_simpanan}</td>
                                        <td className={`border p-3 text-right font-medium ${item.jenis_simpanan === 'pengambilan' ? 'text-red-500' : 'text-green-600'}`}>
                                            {item.jenis_simpanan === 'pengambilan' ? '-' : '+'}{formatRp(item.jumlah)}
                                        </td>
                                        <td className="border p-3 text-sm">{item.keterangan || '-'}</td>
                                        <td className="border p-3 text-center">
                                            <Link href={`/admin-anggota/simpanan/${item.id_simpanan}/edit`} className="text-orange-500 hover:underline text-sm">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="border p-4 text-center text-gray-500">Belum ada riwayat transaksi.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminAnggotaLayout>
    );
}