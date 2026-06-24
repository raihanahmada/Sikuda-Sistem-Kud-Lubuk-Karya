import { rupiah, tanggalID } from '@/utils/format';

export default function TransaksiTerbaru({ items }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Transaksi Terbaru</h2>
                <a href="#" className="text-xs font-medium text-green-700">Lihat Semua</a>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                        <th className="pb-2 font-medium">Keterangan</th>
                        <th className="pb-2 font-medium">Anggota / Kategori</th>
                        <th className="pb-2 font-medium">Tanggal</th>
                        <th className="pb-2 text-right font-medium">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr><td colSpan={4} className="py-6 text-center text-gray-400">Belum ada transaksi</td></tr>
                    ) : (
                        items.map((t) => (
                            <tr key={t.id} className="border-b border-gray-50 last:border-0">
                                <td className="py-3 text-gray-800">{t.keterangan}</td>
                                <td className="py-3 text-gray-500">{t.sumber}</td>
                                <td className="py-3 text-gray-400">{tanggalID(t.tanggal_transaksi)}</td>
                                <td className={`py-3 text-right font-semibold ${
                                    t.arah === 'masuk' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {t.arah === 'masuk' ? '+' : '-'}{rupiah(t.nominal)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
