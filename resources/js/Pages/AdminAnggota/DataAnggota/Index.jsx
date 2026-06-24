import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

// 🔴 PERBAIKAN: Ubah props menjadi 'dataAnggota' sesuai yang dikirim dari Controller
export default function Index({ dataAnggota = [] }) {
    // State untuk fitur Filter Status (Sesuai SKPL UC06)
    const [statusFilter, setStatusFilter] = useState('');

    const handleFilterChange = (e) => {
        const selectedStatus = e.target.value;
        setStatusFilter(selectedStatus);
        
        // Mengirim request filter ke Laravel
        router.get('/admin-anggota/data-anggota', 
            { status: selectedStatus }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus anggota ini? Sistem akan menolak jika anggota memiliki transaksi aktif sesuai aturan SKPL.')) {
            router.delete(`/admin-anggota/data-anggota/${id}`);
        }
    };

    return (
        <AdminAnggotaLayout title="Data Anggota">
            <div className="bg-white p-6 rounded-xl shadow">
                
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Data Anggota Koperasi</h2>
                    
                    <div className="flex space-x-3">
                        {/* 🟢 FITUR BARU: Filter Status (SKPL UC06 S.2) */}
                        <select 
                            className="border p-2 rounded-lg bg-gray-50"
                            value={statusFilter}
                            onChange={handleFilterChange}
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="pasif">Pasif</option>
                            <option value="keluar">Keluar</option>
                        </select>

                        <Link
                            href="/admin-anggota/pendaftaran-anggota/create"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            + Tambah Anggota Lama
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-3 text-left">No</th>
                                <th className="border p-3 text-left">NIK</th>
                                <th className="border p-3 text-left">Nama Lengkap</th>
                                <th className="border p-3 text-left">No HP</th>
                                <th className="border p-3 text-center">Status</th>
                                <th className="border p-3 text-center">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dataAnggota.length > 0 ? (
                                dataAnggota.map((item, index) => (
                                    <tr key={item.id_anggota} className="hover:bg-gray-50">
                                        <td className="border p-3">{index + 1}</td>
                                        
                                        <td className="border p-3">{item.nik}</td>
                                        
                                        {/* 🔴 PERBAIKAN: Menggunakan nama_lengkap sesuai DPPL */}
                                        <td className="border p-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                        
                                        {/* 🔴 PERBAIKAN: Menggunakan no_telepon sesuai DPPL */}
                                        <td className="border p-3">{item.no_telepon || '-'}</td>
                                        
                                        {/* 🟢 FITUR BARU: Menampilkan badge status anggota */}
                                        <td className="border p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                item.status_keanggotaan === 'aktif' ? 'bg-green-100 text-green-700' : 
                                                item.status_keanggotaan === 'pasif' ? 'bg-yellow-100 text-yellow-700' : 
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {item.status_keanggotaan.toUpperCase()}
                                            </span>
                                        </td>
                                        
                                        <td className="border p-3 text-center space-x-3">
                                            <Link 
                                                href={`/admin-anggota/data-anggota/${item.id_anggota}/edit`}
                                                className="text-orange-500 hover:text-orange-700 font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(item.id_anggota)}
                                                className="text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="border p-6 text-center text-gray-500">
                                        Tidak ada data anggota ditemukan.
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