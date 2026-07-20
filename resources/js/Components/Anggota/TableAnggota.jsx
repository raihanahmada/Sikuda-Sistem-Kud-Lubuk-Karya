// File: resources/js/Components/Anggota/TableAnggota.jsx

import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';

// Pindahkan StatusBadge ke sini karena hanya dipakai di dalam tabel
function StatusBadge({ status }) {
    const config = {
        aktif:  { label: 'AKTIF',  className: 'bg-[#E8F5E9] text-[#1B8A3A] dark:bg-[#1B8A3A]/15 dark:text-emerald-400' },
        pasif:  { label: 'PASIF',  className: 'bg-[#FEF3C7] text-[#D97706] dark:bg-yellow-900/15 dark:text-yellow-400' },
    };
    const s = config[status] || { label: status.toUpperCase(), className: 'bg-[#FEE2E2] text-[#DC2626] dark:bg-red-900/15 dark:text-red-400' };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.className}`}>
            {s.label}
        </span>
    );
}

export default function TableAnggota({ hasilPencarian, handleDelete }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            {hasilPencarian.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-600">
                    <Users size={40} className="mb-3" />
                    <p className="text-base italic">Tidak ada data anggota ditemukan.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-base">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3 dark:text-gray-400">No</th>
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3 dark:text-gray-400">NIK</th>
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3 dark:text-gray-400">Nama Lengkap</th>
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3 dark:text-gray-400">No HP</th>
                                <th className="text-center text-sm text-gray-500 font-semibold px-4 py-3 dark:text-gray-400">Status</th>
                                <th className="text-center text-sm text-gray-500 font-semibold px-4 py-3 dark:text-gray-400">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasilPencarian.map((item, index) => (
                                <tr key={item.id_anggota} className="border-b border-gray-50 hover:bg-gray-50 transition dark:border-gray-800 dark:hover:bg-gray-800">
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{item.nik}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{item.nama_lengkap}</td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{item.no_telepon || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={item.status_keanggotaan} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/admin-anggota/data-anggota/${item.id_anggota}/edit`}
                                                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition dark:text-amber-400 dark:bg-amber-900/15 dark:border-amber-900/30 dark:hover:bg-amber-900/25"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id_anggota)}
                                                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition dark:text-red-400 dark:bg-red-900/15 dark:border-red-900/30 dark:hover:bg-red-900/25"
                                            >
                                                Hapus
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
    );
}
