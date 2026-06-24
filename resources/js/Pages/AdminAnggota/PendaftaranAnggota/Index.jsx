import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';

// 1. Ubah parameter props menjadi 'pendaftar' sesuai yang dikirim dari Controller
export default function Index({ pendaftar = [] }) {
    return (
        <AdminAnggotaLayout title="Pendaftaran Anggota">

            <div className="bg-white p-6 rounded-xl shadow">

                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Data Pendaftaran</h2>

                    <Link
                        href="/admin-anggota/pendaftaran-anggota/create"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        + Daftar Anggota
                    </Link>
                </div>

                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">No</th>
                            <th className="border p-2">Nama</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pendaftar.length > 0 ? (
                            pendaftar.map((item, index) => (
                                // 2. Sesuaikan 'item.id' menjadi 'item.id_anggota'
                                <tr key={item.id_anggota} className="text-center">
                                    <td className="border p-2">{index + 1}</td>
                                    
                                    {/* 3. Sesuaikan 'item.nama' menjadi 'item.nama_lengkap' */}
                                    <td className="border p-2">{item.nama_lengkap}</td>
                                    
                                    {/* 4. Sesuaikan 'item.status' menjadi 'item.status_keanggotaan' */}
                                    <td className="border p-2">
                                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                                            {item.status_keanggotaan}
                                        </span>
                                    </td>
                                    
                                    <td className="border p-2 space-x-2">
                                        <Link 
                                            href={`/admin-anggota/pendaftaran-anggota/${item.id_anggota}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Detail
                                        </Link>

                                        <Link 
                                            href={`/admin-anggota/pendaftaran-anggota/${item.id_anggota}/edit`}
                                            className="text-orange-500 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            // 5. Tampilan jika data masih kosong
                            <tr>
                                <td colSpan="4" className="border p-4 text-center text-gray-500">
                                    Belum ada data pendaftaran anggota.
                                </td>
                            </tr>
                        )}
                    </tbody>

                </table>

            </div>

        </AdminAnggotaLayout>
    );
}