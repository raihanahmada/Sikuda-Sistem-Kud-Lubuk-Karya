import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';

export default function Show({ anggota }) {
    return (
        <AdminAnggotaLayout title="Detail Keaktifan">
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-4">Profil Keaktifan: {anggota.nama_lengkap}</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Status Saat Ini</p>
                        <p className="text-lg font-bold">{anggota.status_keanggotaan}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Total Transaksi</p>
                        <p className="text-lg font-bold">{anggota.penjualan_count} Kali</p>
                    </div>
                </div>
                {/* Kamu bisa tambah tabel riwayat detail transaksi di sini */}
            </div>
        </AdminAnggotaLayout>
    );
}