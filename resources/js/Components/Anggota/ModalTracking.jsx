import ModalShell from './ModalShell';
import { Activity } from 'lucide-react';

export default function ModalTracking({ anggota, onTutup }) {
    return (
        <ModalShell title="Profil Keaktifan" subtitle={anggota.nama_lengkap} icon={Activity} onTutup={onTutup} maxWidth="max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl p-4 dark:bg-gray-900 dark:border-emerald-900/40">
                    <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">Status Saat Ini</p>
                    <p className="text-xl font-bold text-[#1B8A3A]">{anggota.status_keanggotaan}</p>
                </div>
                <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl p-4 dark:bg-gray-900 dark:border-emerald-900/40">
                    <p className="text-sm text-gray-500 mb-1 dark:text-gray-400">Total Transaksi</p>
                    <p className="text-xl font-bold text-[#1B8A3A]">{anggota.penjualan_count} Kali</p>
                </div>
            </div>
            <div className="flex justify-end pt-4">
                <button type="button" onClick={onTutup} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition">
                    Tutup
                </button>
            </div>
        </ModalShell>
    );
}
