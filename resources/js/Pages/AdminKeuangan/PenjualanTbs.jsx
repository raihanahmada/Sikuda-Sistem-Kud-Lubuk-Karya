import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';
import { rupiah, tanggalID } from '@/utils/format';
import useDebounce from '@/utils/useDebounce';

const ModalPenjualanTbs = lazy(() => import('@/Components/Keuangan/ModalPenjualanTbs'));
const ModalHargaTbs     = lazy(() => import('@/Components/Keuangan/ModalHargaTbs'));

export default function PenjualanTbs({ penjualan, hargaBerlaku, daftarAnggota, filter, flash }) {
    const [modalJual, setModalJual] = useState({ buka: false, data: null });
    const [modalHarga, setModalHarga] = useState(false);
    const [cari, setCari] = useState(filter.cari ?? '');
    const cariDebounced = useDebounce(cari, 400);

    const hapus = (id) => {
        if (!confirm('Hapus penjualan TBS ini? Kas masuk terkait ikut dibatalkan.')) return;
        router.delete(route('admin-keuangan.penjualan-tbs.destroy', id), { preserveScroll: true });
    };

    // Debounce supaya tidak request ke server setiap ketikan
    useEffect(() => {
        if (cariDebounced === (filter.cari ?? '')) return;
        router.get(route('admin-keuangan.penjualan-tbs.index'),
            { cari: cariDebounced || undefined },
            { preserveState: true, preserveScroll: true, replace: true });
    }, [cariDebounced]);

    return (
        <KeuanganLayout title="Penjualan TBS — Keuangan">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Penjualan TBS</h1>
                <button onClick={() => setModalJual({ buka: true, data: null })}
                    disabled={!hargaBerlaku}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                    + Tambah Penjualan
                </button>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{flash.sukses}</div>
            )}

            {/* Kartu harga TBS berlaku */}
            <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Harga TBS Berlaku</p>
                    {hargaBerlaku ? (
                        <>
                            <p className="mt-1 text-2xl font-bold text-green-700">{rupiah(hargaBerlaku.harga_per_kg)}<span className="text-sm font-normal text-gray-400"> /kg</span></p>
                            <p className="text-xs text-gray-400">Berlaku sejak {tanggalID(hargaBerlaku.berlaku_mulai)}</p>
                        </>
                    ) : (
                        <p className="mt-1 text-sm text-red-600">Harga belum diatur — set dulu sebelum mencatat penjualan.</p>
                    )}
                </div>
                <button onClick={() => setModalHarga(true)}
                    className="rounded-lg border border-green-600 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50">
                    {hargaBerlaku ? 'Ubah Harga' : 'Set Harga'}
                </button>
            </div>

            {/* Pencarian */}
            <div className="mb-4 flex items-center gap-3">
                <input type="text" value={cari} onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari nama anggota…"
                    className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>

            {/* Tabel penjualan */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                            <th className="pb-2 font-medium">Tanggal</th>
                            <th className="pb-2 font-medium">Anggota</th>
                            <th className="pb-2 text-right font-medium">Berat (kg)</th>
                            <th className="pb-2 text-right font-medium">Harga/kg</th>
                            <th className="pb-2 text-right font-medium">Total Nilai</th>
                            <th className="pb-2 text-right font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {penjualan.data.length === 0 ? (
                            <tr><td colSpan={6} className="py-6 text-center text-gray-400">Belum ada penjualan TBS</td></tr>
                        ) : (
                            penjualan.data.map((p) => (
                                <tr key={p.id_penjualan} className="border-b border-gray-50 last:border-0">
                                    <td className="py-3 text-gray-500">{tanggalID(p.tanggal_timbang)}</td>
                                    <td className="py-3 text-gray-800">{p.nama_anggota}</td>
                                    <td className="py-3 text-right text-gray-600">{p.berat_bersih_kg}</td>
                                    <td className="py-3 text-right text-gray-600">{rupiah(p.harga_per_kg)}</td>
                                    <td className="py-3 text-right font-semibold text-green-600">{rupiah(p.total_nilai)}</td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => setModalJual({ buka: true, data: p })}
                                            className="mr-3 text-xs font-medium text-amber-600 hover:underline">Edit</button>
                                        <button onClick={() => hapus(p.id_penjualan)}
                                            className="text-xs font-medium text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {penjualan.last_page > 1 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {penjualan.links.map((l, i) => (
                            <Link key={i} href={l.url ?? '#'} preserveScroll preserveState
                                dangerouslySetInnerHTML={{ __html: l.label }}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    l.active ? 'bg-green-700 text-white'
                                    : l.url ? 'text-gray-600 hover:bg-gray-100' : 'cursor-default text-gray-300'
                                }`} />
                        ))}
                    </div>
                )}
            </div>

            {modalJual.buka && (
                <Suspense fallback={null}>
                    <ModalPenjualanTbs
                        data={modalJual.data}
                        hargaBerlaku={hargaBerlaku}
                        daftarAnggota={daftarAnggota}
                        onTutup={() => setModalJual({ buka: false, data: null })}
                    />
                </Suspense>
            )}

            {modalHarga && (
                <Suspense fallback={null}>
                    <ModalHargaTbs
                        hargaBerlaku={hargaBerlaku}
                        onTutup={() => setModalHarga(false)}
                    />
                </Suspense>
            )}
        </KeuanganLayout>
    );
}
