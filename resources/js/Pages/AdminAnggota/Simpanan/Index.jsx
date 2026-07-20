import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link, router } from '@inertiajs/react';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { Search, Plus, PiggyBank } from 'lucide-react';

const ModalSimpanan = lazy(() => import('@/Components/Anggota/ModalSimpanan'));
const ModalDetailSimpanan = lazy(() => import('@/Components/Anggota/ModalDetailSimpanan'));

export default function Index({ rekapSimpanan = { data: [], links: [] }, daftarAnggota = [], filters = {}, flash = {} }) {

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(angka);
    };

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    useEffect(() => {
        document.title = `Simpanan Anggota (${rekapSimpanan.total}) — SIKUDA`;
        return () => { document.title = 'SIKUDA'; };
    }, [rekapSimpanan]);
    // ===== AKHIR PENERAPAN useEffect =====

    // ===== PENERAPAN MATERI: Data JSON Search (Pertemuan 4) =====
    const [dataForm, setDataForm] = useState({
        searchTerm: filters.search || '',
    });
    const isFirstRender = useRef(true);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({ ...dataForm, [name]: value });
    };
    // ===== AKHIR STATE =====

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get(
                '/admin-anggota/simpanan',
                { search: dataForm.searchTerm },
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [dataForm.searchTerm]);

    // ===== Modal popup in-place (gaya sama seperti Kas Harian) =====
    const [modal, setModal] = useState({ mode: null, id: null });
    const tutupModal = () => setModal({ mode: null, id: null });
    const anggotaDetail = modal.mode === 'detail' ? rekapSimpanan.data.find(a => a.id_anggota === modal.id) : null;

    return (
        <AdminAnggotaLayout title="Simpanan Anggota">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Data Simpanan Anggota</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500">KUD Lubuk Karya</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Cari nama anggota..."
                            className="pl-11 pr-4 py-2.5 text-base border border-gray-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                            value={dataForm.searchTerm}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        onClick={() => setModal({ mode: 'create', id: null })}
                        className="inline-flex items-center justify-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition"
                    >
                        <Plus size={18} />
                        Tambah Simpanan
                    </button>
                </div>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100 dark:bg-green-900/15 dark:text-green-400 dark:border-green-900/30">
                    {flash.sukses}
                </div>
            )}

            {/* TABEL */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                {rekapSimpanan.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-600">
                        <PiggyBank size={40} className="mb-3" />
                        <p className="text-base italic">Belum ada data simpanan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-base">
                            <thead>
                                <tr className="border-b-2 border-emerald-200 bg-emerald-100/80 dark:border-gray-800 dark:bg-gray-800/60">
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3 dark:text-emerald-400">No</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3 dark:text-emerald-400">Nama</th>
                                    <th className="text-right text-sm text-emerald-800 font-semibold px-4 py-3 dark:text-emerald-400">Pokok</th>
                                    <th className="text-right text-sm text-emerald-800 font-semibold px-4 py-3 dark:text-emerald-400">Wajib</th>
                                    <th className="text-right text-sm text-emerald-800 font-semibold px-4 py-3 dark:text-emerald-400">Saldo</th>
                                    <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3 dark:text-emerald-400">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rekapSimpanan.data.map((item, index) => (
                                    <tr key={item.id_anggota} className="border-b border-emerald-100 hover:bg-emerald-50 transition dark:border-gray-800 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(rekapSimpanan.current_page - 1) * rekapSimpanan.per_page + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{item.nama_lengkap}</td>
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{formatRupiah(item.pokok)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{formatRupiah(item.wajib)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-[#1B8A3A]">{formatRupiah(item.saldo)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setModal({ mode: 'detail', id: item.id_anggota })}
                                                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition dark:text-blue-400 dark:bg-blue-900/15 dark:border-blue-900/30 dark:hover:bg-blue-900/25"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ===== PENERAPAN MATERI: Pagination Server-Side (pola sama seperti Admin Keuangan) ===== */}
                {rekapSimpanan.last_page > 1 && (
                    <div className="flex justify-center gap-1 border-t border-gray-100 px-4 py-4 dark:border-gray-800">
                        {rekapSimpanan.links.map((l, i) => (
                            <Link
                                key={i}
                                href={l.url ?? '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: l.label }}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    l.active ? 'bg-[#1B8A3A] text-white'
                                    : l.url ? 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'cursor-default text-gray-300 dark:text-gray-700'
                                }`}
                            />
                        ))}
                    </div>
                )}
                {/* ================================================== */}
            </div>

            {modal.mode === 'create' && (
                <Suspense fallback={null}>
                    <ModalSimpanan daftarAnggota={daftarAnggota} onTutup={tutupModal} />
                </Suspense>
            )}

            {modal.mode === 'detail' && anggotaDetail && (
                <Suspense fallback={null}>
                    <ModalDetailSimpanan anggota={anggotaDetail} onTutup={tutupModal} />
                </Suspense>
            )}
        </AdminAnggotaLayout>
    );
}
