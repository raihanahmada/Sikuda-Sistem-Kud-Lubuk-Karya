import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Search, Plus, FileText } from 'lucide-react';

const ModalPendaftaran = lazy(() => import('@/Components/Anggota/ModalPendaftaran'));

function StatusBadge({ status }) {
    const config = {
        aktif: { label: 'AKTIF', bg: '#E8F5E9', color: '#1B8A3A' },
        ditolak: { label: 'DITOLAK', bg: '#FEE2E2', color: '#DC2626' },
        menunggu_verifikasi: { label: 'MENUNGGU VERIFIKASI', bg: '#FEF3C7', color: '#D97706' },
    };
    const s = config[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' };
    return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
            {s.label}
        </span>
    );
}

export default function Index({ pendaftar = { data: [], links: [] }, filters = {}, flash = {} }) {

    // ===== PENERAPAN MATERI: Data JSON Search & Filter (Pertemuan 4) =====
    const [dataForm, setDataForm] = useState({
        searchTerm: filters.search || '',
        selectedStatus: filters.status || '',
    });
    const isFirstRender = useRef(true);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({ ...dataForm, [name]: value });
    };
    // ===== AKHIR STATE =====

    // ===== PENERAPAN MATERI: useEffect dengan Dependency State (Pertemuan 11) =====
    // Setiap searchTerm berubah, kirim request ke server (kelihatan di Network tab)
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get(
                '/admin-anggota/pendaftaran-anggota',
                { search: dataForm.searchTerm, status: dataForm.selectedStatus },
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [dataForm.searchTerm, dataForm.selectedStatus]);
    // ===== AKHIR PENERAPAN useEffect =====

    // ===== Modal popup in-place (gaya sama seperti Kas Harian) =====
    const [modal, setModal] = useState({ buka: false, mode: null, data: null });
    const tutupModal = () => setModal({ buka: false, mode: null, data: null });

    return (
        <AdminAnggotaLayout title="Pendaftaran Anggota">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Data Pendaftaran</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
                <button
                    onClick={() => setModal({ buka: true, mode: 'create', data: null })}
                    className="inline-flex items-center justify-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition"
                >
                    <Plus size={18} />
                    Daftar Anggota
                </button>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
                    {flash.sukses}
                </div>
            )}

            {/* ===== PENERAPAN MATERI: Inputan Search Server-Side ===== */}
            <div className="flex flex-col md:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        name="searchTerm"
                        placeholder="Cari nama pendaftar..."
                        className="w-full pl-11 pr-4 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                        value={dataForm.searchTerm}
                        onChange={handleChange}
                    />
                </div>
                <select
                    name="selectedStatus"
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-base bg-white w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                    value={dataForm.selectedStatus}
                    onChange={handleChange}
                >
                    <option value="">Semua Status</option>
                    <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                    <option value="aktif">Aktif</option>
                    <option value="ditolak">Ditolak</option>
                </select>
            </div>
            {/* ================================================== */}

            {/* TABEL */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                {pendaftar.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                        <FileText size={40} className="mb-3" />
                        <p className="text-base italic">Belum ada data pendaftaran anggota.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-base">
                            <thead>
                                <tr className="border-b-2 border-emerald-200 bg-emerald-100/80">
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">No</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Nama</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Status</th>
                                    <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendaftar.data.map((item, index) => (
                                    <tr key={item.id_anggota} className="border-b border-emerald-100 hover:bg-emerald-50 transition">
                                        <td className="px-4 py-3 text-gray-500">{(pendaftar.current_page - 1) * pendaftar.per_page + index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={item.status_keanggotaan} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setModal({ buka: true, mode: 'detail', data: item })}
                                                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() => setModal({ buka: true, mode: 'edit', data: item })}
                                                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition"
                                                >
                                                    Edit
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
                {pendaftar.last_page > 1 && (
                    <div className="flex justify-center gap-1 border-t border-gray-100 px-4 py-4">
                        {pendaftar.links.map((l, i) => (
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

            {modal.buka && (
                <Suspense fallback={null}>
                    <ModalPendaftaran mode={modal.mode} data={modal.data} onTutup={tutupModal} />
                </Suspense>
            )}
        </AdminAnggotaLayout>
    );
}
