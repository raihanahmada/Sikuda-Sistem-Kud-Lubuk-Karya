import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { Search, Activity } from 'lucide-react';

const ModalTracking = lazy(() => import('@/Components/Anggota/ModalTracking'));

export default function Index({ dataTracking = { data: [], links: [] }, filters = {} }) {

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    useEffect(() => {
        document.title = `Tracking Aktivitas (${dataTracking.total}) — SIKUDA`;
        return () => { document.title = 'SIKUDA'; };
    }, [dataTracking]);
    // ===== AKHIR PENERAPAN useEffect =====

    // ===== PENERAPAN MATERI: Data JSON Search & Filter (Pertemuan 4) =====
    const [dataForm, setDataForm] = useState({
        searchTerm: filters.search || '',
        selectedStatus: '',
    });
    const isFirstRender = useRef(true);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({ ...dataForm, [name]: value });
    };

    // Filter status tetap client-side (hanya menyaring data di halaman berjalan) karena statusEvaluasi dihitung di PHP (bukan kolom database)
    const hasilFilter = dataTracking.data.filter((item) => {
        return dataForm.selectedStatus
            ? item.status_evaluasi === dataForm.selectedStatus
            : true;
    });
    // ===== AKHIR STATE =====

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get(
                '/admin-anggota/tracking',
                { search: dataForm.searchTerm },
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [dataForm.searchTerm]);

    // ===== Modal popup in-place (read-only, gaya sama seperti Kas Harian) =====
    const [modalId, setModalId] = useState(null);
    const anggotaDetail = modalId ? dataTracking.data.find(a => a.id_anggota === modalId) : null;

    return (
        <AdminAnggotaLayout title="Tracking Aktivitas">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Laporan Keaktifan Anggota (Evaluasi)</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Cari nama anggota..."
                            className="pl-11 pr-4 py-2.5 text-base border border-gray-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                            value={dataForm.searchTerm}
                            onChange={handleChange}
                        />
                    </div>

                    <select
                        name="selectedStatus"
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                        value={dataForm.selectedStatus}
                        onChange={handleChange}
                    >
                        <option value="">Semua Status</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                        <option value="Belum Ada Transaksi">Belum Ada Transaksi</option>
                    </select>
                </div>
            </div>

            {/* TABEL */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                {hasilFilter.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                        <Activity size={40} className="mb-3" />
                        <p className="text-base italic">Tidak ada data ditemukan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-base">
                            <thead>
                                <tr className="border-b-2 border-emerald-200 bg-emerald-100/80">
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">No</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Nama Anggota</th>
                                    <th className="text-right text-sm text-emerald-800 font-semibold px-4 py-3">Total TBS (Kg)</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Transaksi Terakhir</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Status Evaluasi</th>
                                    <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hasilFilter.map((item, index) => (
                                    <tr key={item.id_anggota} className="border-b border-emerald-100 hover:bg-emerald-50 transition">
                                        <td className="px-4 py-3 text-gray-500">{(dataTracking.current_page - 1) * dataTracking.per_page + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{item.total_tbs.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500">{item.terakhir_aktif}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                item.status_evaluasi === 'Aktif'
                                                    ? 'bg-emerald-50 text-[#1B8A3A]'
                                                    : 'bg-red-50 text-red-600'
                                            }`}>
                                                {item.status_evaluasi}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => setModalId(item.id_anggota)}
                                                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition"
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
                {dataTracking.last_page > 1 && (
                    <div className="flex justify-center gap-1 border-t border-gray-100 px-4 py-4">
                        {dataTracking.links.map((l, i) => (
                            <Link
                                key={i}
                                href={l.url ?? '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: l.label }}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    l.active ? 'bg-[#1B8A3A] text-white'
                                    : l.url ? 'text-gray-600 hover:bg-gray-100' : 'cursor-default text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                )}
                {/* ================================================== */}
            </div>

            {anggotaDetail && (
                <Suspense fallback={null}>
                    <ModalTracking anggota={anggotaDetail} onTutup={() => setModalId(null)} />
                </Suspense>
            )}
        </AdminAnggotaLayout>
    );
}
