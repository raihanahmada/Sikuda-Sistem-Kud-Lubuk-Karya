import { rupiah, tanggalID } from '@/utils/format';

export default function TransaksiTerbaru({ items }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Transaksi Terbaru</h2>
                <a href="#" className="text-xs font-medium text-green-700 dark:text-emerald-400">Lihat Semua</a>
            </div>

            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                        <th className="pb-2 font-medium">Keterangan</th>
                        <th className="pb-2 font-medium">Anggota / Kategori</th>
                        <th className="pb-2 font-medium">Tanggal</th>
                        <th className="pb-2 text-right font-medium">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr><td colSpan={4} className="py-6 text-center text-gray-400 dark:text-gray-500">Belum ada transaksi</td></tr>
                    ) : (
                        items.map((t) => (
                            <tr key={t.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                                <td className="py-3 text-gray-800 dark:text-gray-100">{t.keterangan}</td>
                                <td className="py-3 text-gray-500 dark:text-gray-400">{t.sumber}</td>
                                <td className="py-3 text-gray-400 dark:text-gray-500">{tanggalID(t.tanggal_transaksi)}</td>
                                <td className={`py-3 text-right font-semibold ${
                                    t.arah === 'masuk' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
