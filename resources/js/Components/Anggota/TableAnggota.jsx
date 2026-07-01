// File: resources/js/Components/Anggota/TableAnggota.jsx

import { Link } from '@inertiajs/react';

// Pindahkan StatusBadge ke sini karena hanya dipakai di dalam tabel
function StatusBadge({ status }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            status === 'aktif' ? 'bg-green-100 text-green-700' : 
            status === 'pasif' ? 'bg-yellow-100 text-yellow-700' : 
            'bg-red-100 text-red-700'
        }`}>
            {status.toUpperCase()}
        </span>
    );
}

export default function TableAnggota({ hasilPencarian, handleDelete }) {
    return (
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
                    {hasilPencarian.length > 0 ? (
                        hasilPencarian.map((item, index) => (
                            <tr key={item.id_anggota} className="hover:bg-gray-50">
                                <td className="border p-3">{index + 1}</td>
                                <td className="border p-3">{item.nik}</td>
                                <td className="border p-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                <td className="border p-3">{item.no_telepon || '-'}</td>
                                <td className="border p-3 text-center">
                                    <StatusBadge status={item.status_keanggotaan} />
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
    );
}