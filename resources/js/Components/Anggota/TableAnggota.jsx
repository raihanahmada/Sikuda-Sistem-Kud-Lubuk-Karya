// File: resources/js/Components/Anggota/TableAnggota.jsx

import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';

// Pindahkan StatusBadge ke sini karena hanya dipakai di dalam tabel
function StatusBadge({ status }) {
    const config = {
        aktif:  { label: 'AKTIF',  bg: '#E8F5E9', color: '#1B8A3A' },
        pasif:  { label: 'PASIF',  bg: '#FEF3C7', color: '#D97706' },
    };
    const s = config[status] || { label: status.toUpperCase(), bg: '#FEE2E2', color: '#DC2626' };
    return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
}

export default function TableAnggota({ hasilPencarian, handleDelete }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {hasilPencarian.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                    <Users size={40} className="mb-3" />
                    <p className="text-base italic">Tidak ada data anggota ditemukan.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-base">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">No</th>
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">NIK</th>
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">Nama Lengkap</th>
                                <th className="text-left text-sm text-gray-500 font-semibold px-4 py-3">No HP</th>
                                <th className="text-center text-sm text-gray-500 font-semibold px-4 py-3">Status</th>
                                <th className="text-center text-sm text-gray-500 font-semibold px-4 py-3">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hasilPencarian.map((item, index) => (
                                <tr key={item.id_anggota} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.nik}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.no_telepon || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={item.status_keanggotaan} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link
                                                href={`/admin-anggota/data-anggota/${item.id_anggota}/edit`}
                                                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id_anggota)}
                                                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition"
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
