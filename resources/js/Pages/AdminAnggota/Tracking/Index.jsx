import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';

export default function Index({ dataTracking = [] }) {
    return (
        <AdminAnggotaLayout title="Tracking Aktivitas">
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold mb-4">Laporan Keaktifan Anggota (Evaluasi)</h2>
                
                <table className="w-full border text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-3">No</th>
                            <th className="border p-3">Nama Anggota</th>
                            <th className="border p-3 text-right">Total TBS (Kg)</th>
                            <th className="border p-3">Transaksi Terakhir</th>
                            <th className="border p-3">Status Evaluasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataTracking.map((item, index) => (
                            <tr key={item.id_anggota} className="border-t hover:bg-gray-50">
                                <td className="border p-3">{index + 1}</td>
                                <td className="border p-3 font-semibold">{item.nama_lengkap}</td>
                                <td className="border p-3 text-right">{item.total_tbs.toLocaleString()}</td>
                                <td className="border p-3">{item.terakhir_aktif}</td>
                                <td className={`border p-3 font-bold ${item.status_evaluasi === 'Aktif' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.status_evaluasi}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminAnggotaLayout>
    );
}