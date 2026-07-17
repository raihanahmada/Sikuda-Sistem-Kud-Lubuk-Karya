import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useEffect } from 'react';

export default function Show({ anggota }) {

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    // Jenis: Dengan Dependency Array Kosong []
    // Fungsi: dijalankan sekali saat halaman detail keaktifan pertama kali dibuka
    // Mengubah judul tab browser sesuai nama anggota yang sedang dilihat
    // Sesuai konsep Dynamic Route — data tampil sesuai ID anggota di URL
    useEffect(() => {
        if (anggota) {
            document.title = `Detail Keaktifan — ${anggota.nama_lengkap}`;
        }
        return () => {
            document.title = 'SIKUDA';
        };
    }, []); // dependency array kosong = jalankan sekali saat mount

    return (
        <AdminAnggotaLayout title="Detail Keaktifan">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h1 className="text-xl font-semibold text-gray-800 mb-4">Profil Keaktifan: {anggota.nama_lengkap}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Status Saat Ini</p>
                        <p className="text-xl font-bold text-gray-800">{anggota.status_keanggotaan}</p>
                    </div>
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                        <p className="text-sm text-gray-500 mb-1">Total Transaksi</p>
                        <p className="text-xl font-bold text-gray-800">{anggota.penjualan_count} Kali</p>
                    </div>
                </div>
            </div>
        </AdminAnggotaLayout>
    );
}
