import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';
import { rupiah, tanggalID } from '@/utils/format';
import useDebounce from '@/utils/useDebounce';

const ModalPenyaluranDana = lazy(() => import('@/Components/Keuangan/ModalPenyaluranDana'));

export default function PenyaluranDana({ penyaluran, ringkasan, penjualanBelumSalur, filter, flash }) {
    const [modal, setModal] = useState({ buka: false, data: null });
    const [cari, setCari] = useState(filter.cari ?? '');
    const cariDebounced = useDebounce(cari, 400);

    const hapus = (id) => {
        if (!confirm('Hapus penyaluran ini? Kas keluar terkait ikut dibatalkan.')) return;
        router.delete(route('admin-keuangan.penyaluran-dana.destroy', id), { preserveScroll: true });
    };

    // Debounce supaya tidak request ke server setiap ketikan
    useEffect(() => {
        if (cariDebounced === (filter.cari ?? '')) return;
        router.get(route('admin-keuangan.penyaluran-dana.index'),
            { cari: cariDebounced || undefined },
            { preserveState: true, preserveScroll: true, replace: true });
    }, [cariDebounced]);

    const adaPenjualan = penjualanBelumSalur.length > 0;

    return (
        <KeuanganLayout title="Penyaluran Dana — Keuangan">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Penyaluran Dana</h1>
                <button onClick={() => setModal({ buka: true, data: null })}
                    disabled={!adaPenjualan}
                    title={adaPenjualan ? '' : 'Tidak ada penjualan TBS yang belum disalurkan'}
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                    + Salurkan Dana
                </button>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{flash.sukses}</div>
            )}

            {/* Ringkasan */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/80">Total Disalurkan ke Anggota</p>
                    <p className="mt-1 text-2xl font-bold">{rupiah(ringkasan.total_disalurkan)}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-700 p-5 text-white shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/80">Total Potongan (Pendapatan KUD)</p>
                    <p className="mt-1 text-2xl font-bold">{rupiah(ringkasan.total_potongan)}</p>
                </div>
            </div>

            {!adaPenjualan && (
                <div className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
                    Semua penjualan TBS sudah disalurkan. Catat penjualan TBS baru untuk menyalurkan dana lagi.
                </div>
            )}

            {/* Pencarian */}
            <div className="mb-4 flex items-center gap-3">
                <input type="text" value={cari} onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari nama anggota…"
                    className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>

            {/* Tabel */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-xs text-gray-400">
                            <th className="pb-2 font-medium">Tanggal</th>
                            <th className="pb-2 font-medium">Anggota</th>
                            <th className="pb-2 text-right font-medium">Total Penjualan</th>
                            <th className="pb-2 text-right font-medium">Potongan</th>
                            <th className="pb-2 text-right font-medium">Dana Bersih</th>
                            <th className="pb-2 text-right font-medium">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {penyaluran.data.length === 0 ? (
                            <tr><td colSpan={6} className="py-6 text-center text-gray-400">Belum ada penyaluran dana</td></tr>
                        ) : (
                            penyaluran.data.map((d) => (
                                <tr key={d.id_penyaluran} className="border-b border-gray-50 last:border-0">
                                    <td className="py-3 text-gray-500">{tanggalID(d.tanggal_penyaluran)}</td>
                                    <td className="py-3 text-gray-800">{d.nama_anggota}</td>
                                    <td className="py-3 text-right text-gray-600">{rupiah(d.total_penjualan)}</td>
                                    <td className="py-3 text-right text-amber-600">−{rupiah(d.total_potongan)}</td>
                                    <td className="py-3 text-right font-semibold text-green-600">{rupiah(d.dana_bersih)}</td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => setModal({ buka: true, data: d })}
                                            className="mr-3 text-xs font-medium text-amber-600 hover:underline">Edit</button>
                                        <button onClick={() => hapus(d.id_penyaluran)}
                                            className="text-xs font-medium text-red-600 hover:underline">Hapus</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {penyaluran.last_page > 1 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {penyaluran.links.map((l, i) => (
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
                    <ModalPenyaluranDana
                        data={modal.data}
                        penjualanBelumSalur={penjualanBelumSalur}
                        onTutup={() => setModal({ buka: false, data: null })}
                    />
                </Suspense>
            )}
        </KeuanganLayout>
    );
}
