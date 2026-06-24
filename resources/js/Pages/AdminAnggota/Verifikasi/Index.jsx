import { Head, Link } from '@inertiajs/react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';

// ✅ PENTING 1: Tangkap props 'antrian' dan 'stats' dari VerifikasiController
export default function Index({ antrian = [], stats = {} }) {
    
    return (
        <AdminAnggotaLayout title="Antrian Verifikasi">
            <Head title="Antrian Verifikasi" />

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-500 text-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-medium opacity-90">Menunggu Verifikasi</h3>
                    {/* ✅ PENTING 2: Tampilkan angka dinamis dari database */}
                    <p className="text-4xl font-bold mt-3">{stats.menunggu || 0}</p>
                </div>

                <div className="bg-green-500 text-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-medium opacity-90">Diterima Hari Ini</h3>
                    <p className="text-4xl font-bold mt-3">{stats.diterima || 0}</p>
                </div>

                <div className="bg-yellow-500 text-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-medium opacity-90">Ditolak Hari Ini</h3>
                    <p className="text-4xl font-bold mt-3">{stats.ditolak || 0}</p>
                </div>
            </div>

            {/* Card Tabel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Daftar Pengajuan Anggota</h2>
                        <p className="text-sm text-gray-500">Pengajuan anggota yang memerlukan verifikasi</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nama</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tanggal Daftar</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* ✅ PENTING 3: Looping data dari 'antrian' (bukan data dummy lagi) */}
                            {antrian.length > 0 ? (
                                antrian.map((item) => (
                                    <tr key={item.id_anggota} className="border-t hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {item.nama_lengkap}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.tanggal_daftar}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                {item.status_keanggotaan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {/* ✅ PENTING 4: URL Detail disesuaikan dengan ID anggota */}
                                            <Link
                                                href={`/admin-anggota/verifikasi/${item.id_anggota}`}
                                                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
                                            >
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        Tidak ada antrian verifikasi saat ini.
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