import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';
import { rupiah, tanggalID } from '@/utils/format';
import useDebounce from '@/utils/useDebounce';

const ModalPembelian = lazy(() => import('@/Components/Keuangan/ModalPembelian'));

export default function Pembelian({ pembelian, filter, daftarAnggota, daftarBarang, flash }) {
    const [modal, setModal] = useState({ buka: false, data: null });
    const [cari, setCari] = useState(filter.cari ?? '');
    const cariDebounced = useDebounce(cari, 350);

    // Debounce: request baru jalan 350ms setelah user berhenti mengetik
    useEffect(() => {
        if (cariDebounced === (filter.cari ?? '')) return;
        router.get(route('admin-keuangan.pembelian.index'),
            { ...filter, cari: cariDebounced || undefined },
            { preserveState: true, preserveScroll: true, replace: true });
    }, [cariDebounced]);

    const hapus = (id) => {
        if (!confirm('Hapus transaksi pembelian ini?')) return;
        router.delete(route('admin-keuangan.pembelian.destroy', id), { preserveScroll: true });
    };

    return (
        <KeuanganLayout title="Pembelian — Keuangan">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembelian</h1>
                <button onClick={() => setModal({ buka: true, data: null })}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
                    + Tambah Pembelian
                </button>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{flash.sukses}</div>
            )}

            <div className="mb-4">
                <input type="text" value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari nama anggota…"
                    className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                            <th className="pb-2 font-medium">Tanggal</th>
                            <th className="pb-2 font-medium">Anggota</th>
                            <th className="pb-2 font-medium">Barang</th>
                            <th className="pb-2 text-right font-medium">Jumlah</th>
                            <th className="pb-2 text-right font-medium">Harga Satuan</th>
                            <th className="pb-2 text-right font-medium">Total</th>
                            <th className="pb-2 text-right font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pembelian.data.length === 0 ? (
                            <tr><td colSpan={7} className="py-6 text-center text-gray-400">Belum ada transaksi pembelian</td></tr>
                        ) : (
                            pembelian.data.map((p) => (
                                <tr key={p.id_pembelian} className="border-b border-gray-50 last:border-0">
                                    <td className="py-3 text-gray-500">{tanggalID(p.tanggal_pembelian)}</td>
                                    <td className="py-3 text-gray-800">{p.nama_anggota}</td>
                                    <td className="py-3 text-gray-600">{p.nama_barang}</td>
                                    <td className="py-3 text-right text-gray-600">{p.jumlah} {p.satuan}</td>
                                    <td className="py-3 text-right text-gray-600">{rupiah(p.harga_satuan)}</td>
                                    <td className="py-3 text-right font-semibold text-gray-900">{rupiah(p.total_harga)}</td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => setModal({ buka: true, data: p })}
                                            className="mr-3 text-xs font-medium text-amber-600 hover:underline">Edit</button>
                                        <button onClick={() => hapus(p.id_pembelian)}
                                            className="text-xs font-medium text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {pembelian.last_page > 1 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {pembelian.links.map((l, i) => (
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

            {modal.buka && (
                <Suspense fallback={null}>
                    <ModalPembelian
                        data={modal.data}
                        daftarAnggota={daftarAnggota}
                        daftarBarang={daftarBarang}
                        onTutup={() => setModal({ buka: false, data: null })}
                    />
                </Suspense>
            )}
        </KeuanganLayout>
    );
}
