import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';

export default function Index({ rekapSimpanan = [] }) {
    
    // Fungsi untuk mengubah angka jadi format Rupiah (Rp 100.000)
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    };

    return (
        <AdminAnggotaLayout title="Simpanan Anggota">
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Data Simpanan Anggota</h2>
                    <Link
                        href="/admin-anggota/simpanan/create"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        + Tambah Simpanan
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-3 text-left">No</th>
                                <th className="border p-3 text-left">Nama</th>
                                <th className="border p-3 text-right">Pokok</th>
                                <th className="border p-3 text-right">Wajib</th>
                                <th className="border p-3 text-right">Saldo</th>
                                <th className="border p-3 text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rekapSimpanan.length > 0 ? (
                                rekapSimpanan.map((item, index) => (
                                    <tr key={item.id_anggota} className="hover:bg-gray-50">
                                        <td className="border p-3">{index + 1}</td>
                                        <td className="border p-3 font-medium">{item.nama_lengkap}</td>
                                        <td className="border p-3 text-right text-gray-600">{formatRupiah(item.pokok)}</td>
                                        <td className="border p-3 text-right text-gray-600">{formatRupiah(item.wajib)}</td>
                                        <td className="border p-3 text-right font-bold text-green-700">{formatRupiah(item.saldo)}</td>
                                        <td className="border p-3 text-center space-x-3">
                                            <Link 
                                                href={`/admin-anggota/simpanan/${item.id_anggota}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Detail
                                            </Link>
                                            <Link 
                                                href={`/admin-anggota/simpanan/${item.id_anggota}/edit`}
                                                className="text-orange-500 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="border p-6 text-center text-gray-500">
                                        Belum ada data simpanan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminAnggotaLayout>
    );
}