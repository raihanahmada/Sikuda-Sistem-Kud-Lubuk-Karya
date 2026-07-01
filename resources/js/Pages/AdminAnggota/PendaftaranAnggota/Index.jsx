import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ pendaftar = [] }) {

    // ===== PENERAPAN MATERI: Data JSON Search & Filter (Pertemuan 4) =====
    // Inisialisasi state dataForm (Best Practice State dari modul)
    const [dataForm, setDataForm] = useState({
        searchTerm: '',
        selectedStatus: '',
    });

    // Handle perubahan nilai input form secara general
    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({
            ...dataForm,
            [name]: value,
        });
    };

    // Terapkan logic dalam memfilter data JSON sesuai dengan searchTerm dan selectedStatus
    const _searchTerm = dataForm.searchTerm.toLowerCase();
    const filteredPendaftar = pendaftar.filter((item) => {
        const matchesSearch = item.nama_lengkap
            .toLowerCase()
            .includes(_searchTerm);

        const matchesStatus = dataForm.selectedStatus
            ? item.status_keanggotaan === dataForm.selectedStatus
            : true;

        return matchesSearch && matchesStatus;
    });
    // ===== AKHIR LOGIC SEARCH & FILTER =====

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

                {/* ===== PENERAPAN MATERI: Inputan Search & Select Filter ===== */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        name="searchTerm"
                        placeholder="Cari nama pendaftar..."
                        className="border p-2 w-full rounded"
                        value={dataForm.searchTerm}
                        onChange={handleChange}
                    />

                    <select
                        name="selectedStatus"
                        className="border p-2 w-full md:w-64 rounded"
                        value={dataForm.selectedStatus}
                        onChange={handleChange}
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="pasif">Pasif</option>
                        <option value="keluar">Keluar</option>
                    </select>
                </div>
                {/* ================================================================ */}

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
                        {/* ===== PENERAPAN MATERI: Data JSON (List) - menggunakan hasil filter ===== */}
                        {filteredPendaftar.length > 0 ? (
                            filteredPendaftar.map((item, index) => (
                                <tr key={item.id_anggota} className="text-center">
                                    <td className="border p-2">{index + 1}</td>
                                    <td className="border p-2">{item.nama_lengkap}</td>
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
                            <tr>
                                <td colSpan="4" className="border p-4 text-center text-gray-500">
                                    Belum ada data pendaftaran anggota.
                                </td>
                            </tr>
                        )}
                        {/* ================================================================ */}
                    </tbody>

                </table>

            </div>

        </AdminAnggotaLayout>
    );
}