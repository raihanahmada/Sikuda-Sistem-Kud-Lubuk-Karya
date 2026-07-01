import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';

export default function Index({ antrian = [], stats = {} }) {

    // ===== PENERAPAN MATERI: Data JSON Search & Filter (Pertemuan 4) =====
    // Inisialisasi state dataForm (Best Practice State dari modul)
    const [dataForm, setDataForm] = useState({
        searchTerm: '',
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({
            ...dataForm,
            [name]: value,
        });
    };

    // Logic filter pencarian nama menggunakan .filter()
    const _searchTerm = dataForm.searchTerm.toLowerCase();
    const hasilPencarian = antrian.filter((item) =>
        item.nama_lengkap.toLowerCase().includes(_searchTerm)
    );
    // ===== AKHIR LOGIC SEARCH =====
    
    return (
        <AdminAnggotaLayout title="Antrian Verifikasi">
            <Head title="Antrian Verifikasi" />

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-red-500 text-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-medium opacity-90">Menunggu Verifikasi</h3>
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
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-5 border-b gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Daftar Pengajuan Anggota</h2>
                        <p className="text-sm text-gray-500">Pengajuan anggota yang memerlukan verifikasi</p>
                    </div>

                    {/* ===== PENERAPAN MATERI: Inputan Search ===== */}
                    <input
                        type="text"
                        name="searchTerm"
                        placeholder="Cari nama pengajuan..."
                        className="border p-2 rounded-lg w-full md:w-64"
                        value={dataForm.searchTerm}
                        onChange={handleChange}
                    />
                    {/* ================================================== */}
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
                            {/* ===== PENERAPAN MATERI: Data JSON (List) - pakai hasilPencarian ===== */}
                            {hasilPencarian.length > 0 ? (
                                hasilPencarian.map((item) => (
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
                            {/* ================================================================ */}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminAnggotaLayout>
    );
}