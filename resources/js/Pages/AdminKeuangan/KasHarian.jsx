

import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';
import { rupiah, tanggalID } from '@/utils/format';
import useDebounce from '@/utils/useDebounce';

// Modal di-lazy load: hanya diunduh saat user menambah/mengedit
const ModalTransaksiKas = lazy(() => import('@/Components/Keuangan/ModalTransaksiKas'));

export default function KasHarian({ transaksi, ringkasan, filter, flash }) {
    const [modal, setModal] = useState({ buka: false, data: null });
    const [cari, setCari] = useState(filter.cari ?? '');
    const cariDebounced = useDebounce(cari, 400);

    const ubahFilter = (patch) => {
        router.get(route('admin-keuangan.kas-harian.index'),
            { ...filter, ...patch },
            { preserveState: true, preserveScroll: true, replace: true });
    };

    // Debounce supaya tidak request ke server setiap ketikan
    useEffect(() => {
        if (cariDebounced === (filter.cari ?? '')) return;
        ubahFilter({ cari: cariDebounced || null });
    }, [cariDebounced]);

    const hapus = (id) => {
        if (!confirm('Hapus transaksi kas ini?')) return;
        router.delete(route('admin-keuangan.kas-harian.destroy', id), { preserveScroll: true });
    };

    const TABS = [
        { key: 'semua',  label: 'Semua' },
        { key: 'masuk',  label: 'Kas Masuk' },
        { key: 'keluar', label: 'Kas Keluar' },
    ];

    return (
        <KeuanganLayout title="Kas Harian — Keuangan">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kas Harian</h1>
                <button
                    onClick={() => setModal({ buka: true, data: null })}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
                    + Tambah Transaksi
                </button>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/15 dark:text-green-400">
                    {flash.sukses}
                </div>
            )}

            {/* Ringkasan */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <KartuRingkas judul="Total Kas Masuk"  nilai={ringkasan.total_masuk}  tema="from-blue-500 to-blue-600" />
                <KartuRingkas judul="Total Kas Keluar" nilai={ringkasan.total_keluar} tema="from-red-500 to-red-600" />
                <KartuRingkas judul="Saldo"            nilai={ringkasan.saldo}        tema="from-green-600 to-green-700" />
            </div>

            {/* Filter */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs dark:bg-gray-800">
                    {TABS.map((t) => (
                        <button key={t.key} onClick={() => ubahFilter({ jenis: t.key })}
                            className={`rounded-md px-3 py-1.5 font-medium transition ${
                                filter.jenis === t.key ? 'bg-white text-green-700 shadow-sm dark:bg-gray-900 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <input type="text" value={cari} onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari keterangan…"
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" />
                <input type="date" value={filter.dari ?? ''} onChange={(e) => ubahFilter({ dari: e.target.value })}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" />
                <span className="text-sm text-gray-400 dark:text-gray-500">s/d</span>
                <input type="date" value={filter.sampai ?? ''} onChange={(e) => ubahFilter({ sampai: e.target.value })}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" />
                {(filter.dari || filter.sampai || filter.jenis !== 'semua' || filter.cari) && (
                    <button onClick={() => { setCari(''); ubahFilter({ jenis: 'semua', dari: null, sampai: null, cari: null }); }}
                        className="text-xs font-medium text-gray-500 underline dark:text-gray-400">
                        Reset
                    </button>
                )}
            </div>

            {/* Tabel */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                            <th className="pb-2 font-medium">Tanggal</th>
                            <th className="pb-2 font-medium">Jenis</th>
                            <th className="pb-2 font-medium">Keterangan</th>
                            <th className="pb-2 text-right font-medium">Nominal</th>
                            <th className="pb-2 text-right font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaksi.data.length === 0 ? (
                            <tr><td colSpan={5} className="py-6 text-center text-gray-400 dark:text-gray-500">Belum ada transaksi</td></tr>
                        ) : (
                            transaksi.data.map((t) => (
                                <tr key={t.id_transaksi} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                                    <td className="py-3 text-gray-500 dark:text-gray-400">{tanggalID(t.tanggal_transaksi)}</td>
                                    <td className="py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                            t.jenis_kas === 'masuk' ? 'bg-green-50 text-green-700 dark:bg-green-900/15 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/15 dark:text-red-400'
                                        }`}>
                                            {t.jenis_kas === 'masuk' ? 'Masuk' : 'Keluar'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-gray-800 dark:text-gray-100">{t.keterangan}</td>
                                    <td className={`py-3 text-right font-semibold ${
                                        t.jenis_kas === 'masuk' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {t.jenis_kas === 'masuk' ? '+' : '-'}{rupiah(t.nominal)}
                                    </td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => setModal({ buka: true, data: t })}
                                            className="mr-3 text-xs font-medium text-amber-600 hover:underline dark:text-yellow-400">Edit</button>
                                        <button onClick={() => hapus(t.id_transaksi)}
                                            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {transaksi.last_page > 1 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {transaksi.links.map((l, i) => (
                            <Link key={i} href={l.url ?? '#'} preserveScroll preserveState
                                dangerouslySetInnerHTML={{ __html: l.label }}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    l.active ? 'bg-green-700 text-white'
                                    : l.url ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'cursor-default text-gray-300 dark:text-gray-600'
                                }`} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal (lazy) */}
            {modal.buka && (
                <Suspense fallback={null}>
                    <ModalTransaksiKas
                        data={modal.data}
                        onTutup={() => setModal({ buka: false, data: null })}
                    />
                </Suspense>
            )}
        </KeuanganLayout>
    );
}

function KartuRingkas({ judul, nilai, tema }) {
    return (
        <div className={`rounded-xl bg-gradient-to-br ${tema} p-5 text-white shadow-sm`}>
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">{judul}</p>
            <p className="mt-1 text-2xl font-bold">{rupiah(nilai)}</p>
        </div>
    );
}
