import { router } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';
import { rupiah, tanggalID } from '@/utils/format';

const PERIODE = [
    { key: 'mingguan',  label: 'Mingguan' },
    { key: '15harian',  label: '15 Harian' },
    { key: 'bulanan',   label: 'Bulanan' },
    { key: 'tahunan',   label: 'Tahunan' },
];

export default function Laporan({ periode, tanggal, meta, ringkasan, rincian, posisiSimpanan, isTutupBuku }) {
    const ubah = (patch) => {
        router.get(route('admin-keuangan.laporan.index'),
            { periode, tanggal, ...patch },
            { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <KeuanganLayout title="Laporan Periodik — Keuangan">
            {/* Kontrol — disembunyikan saat cetak */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <h1 className="text-2xl font-bold text-gray-900">Laporan Periodik</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs">
                        {PERIODE.map((p) => (
                            <button key={p.key} onClick={() => ubah({ periode: p.key })}
                                className={`rounded-md px-3 py-1.5 font-medium transition ${
                                    periode === p.key ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'
                                }`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <input type="date" value={tanggal}
                        onChange={(e) => ubah({ tanggal: e.target.value })}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                    <button onClick={() => window.print()}
                        className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-800">
                        Cetak
                    </button>
                </div>
            </div>

            {/* Area laporan (yang dicetak) */}
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm print:border-0 print:shadow-none print:p-0">
                {/* Kop laporan */}
                <div className="mb-6 border-b border-gray-200 pb-4 text-center">
                    <h2 className="text-lg font-bold text-gray-900">KUD LUBUK KARYA</h2>
                    <p className="text-sm text-gray-600">
                        Laporan Keuangan {isTutupBuku ? '— Tutup Buku' : 'Periodik'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{meta.label}</p>
                    <p className="text-xs text-gray-400">
                        Periode {tanggalID(meta.mulai)} s/d {tanggalID(meta.selesai)}
                    </p>
                </div>

                {/* Ringkasan kas */}
                <table className="mb-6 w-full text-sm">
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 text-gray-600">Saldo Awal Periode</td>
                            <td className="py-2 text-right font-medium text-gray-900">{rupiah(ringkasan.saldo_awal)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 text-gray-600">Total Kas Masuk</td>
                            <td className="py-2 text-right font-medium text-green-600">+{rupiah(ringkasan.total_masuk)}</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="py-2 text-gray-600">Total Kas Keluar</td>
                            <td className="py-2 text-right font-medium text-red-600">−{rupiah(ringkasan.total_keluar)}</td>
                        </tr>
                        <tr className="border-t-2 border-gray-300">
                            <td className="py-2 font-bold text-gray-900">Saldo Akhir Periode</td>
                            <td className="py-2 text-right text-lg font-bold text-gray-900">{rupiah(ringkasan.saldo_akhir)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Posisi simpanan (bulanan/tahunan) */}
                {posisiSimpanan && (
                    <div className="mb-6">
                        <h3 className="mb-2 text-sm font-bold text-gray-800">Posisi Simpanan Anggota</h3>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1.5 text-gray-600">Simpanan Pokok</td>
                                    <td className="py-1.5 text-right text-gray-900">{rupiah(posisiSimpanan.pokok)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1.5 text-gray-600">Simpanan Wajib</td>
                                    <td className="py-1.5 text-right text-gray-900">{rupiah(posisiSimpanan.wajib)}</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-1.5 text-gray-600">Pengambilan</td>
                                    <td className="py-1.5 text-right text-red-600">−{rupiah(posisiSimpanan.pengambilan)}</td>
                                </tr>
                                <tr className="border-t border-gray-300">
                                    <td className="py-1.5 font-bold text-gray-900">Total Simpanan</td>
                                    <td className="py-1.5 text-right font-bold text-gray-900">{rupiah(posisiSimpanan.saldo)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Rincian transaksi */}
                <h3 className="mb-2 text-sm font-bold text-gray-800">Rincian Transaksi Kas</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                            <th className="pb-2 font-medium">Tanggal</th>
                            <th className="pb-2 font-medium">Keterangan</th>
                            <th className="pb-2 text-right font-medium">Masuk</th>
                            <th className="pb-2 text-right font-medium">Keluar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rincian.length === 0 ? (
                            <tr><td colSpan={4} className="py-6 text-center text-gray-400">Tidak ada data untuk periode ini</td></tr>
                        ) : (
                            rincian.map((t, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                    <td className="py-2 text-gray-500">{tanggalID(t.tanggal)}</td>
                                    <td className="py-2 text-gray-800">{t.keterangan}</td>
                                    <td className="py-2 text-right text-green-600">{t.jenis_kas === 'masuk' ? rupiah(t.nominal) : '—'}</td>
                                    <td className="py-2 text-right text-red-600">{t.jenis_kas === 'keluar' ? rupiah(t.nominal) : '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Footer cetak */}
                <div className="mt-8 flex justify-between text-xs text-gray-400">
                    <span>Dicetak: {meta.dicetak_pada}</span>
                    <span>SIKUDA — KUD Lubuk Karya</span>
                </div>

                {isTutupBuku && (
                    <div className="mt-10 hidden grid-cols-2 gap-8 text-center text-sm print:grid">
                        <div>
                            <p className="mb-16 text-gray-600">Pengurus Keuangan</p>
                            <p className="border-t border-gray-400 pt-1">(……………………)</p>
                        </div>
                        <div>
                            <p className="mb-16 text-gray-600">Ketua / Pemilik</p>
                            <p className="border-t border-gray-400 pt-1">(……………………)</p>
                        </div>
                    </div>
                )}
            </div>
        </KeuanganLayout>
    );
}
