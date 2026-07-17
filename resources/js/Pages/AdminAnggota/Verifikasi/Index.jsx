import { Head, Link, router } from '@inertiajs/react';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Search, ClipboardList } from 'lucide-react';

const ModalVerifikasi = lazy(() => import('@/Components/Anggota/ModalVerifikasi'));

export default function Index({ antrian = { data: [], links: [] }, stats = {}, filters = {}, flash = {} }) {

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
                '/admin-anggota/verifikasi',
                { search: dataForm.searchTerm },
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [dataForm.searchTerm]);

    // ===== Modal popup in-place (gaya sama seperti Kas Harian) =====
    const [modalId, setModalId] = useState(null);
    const anggotaDetail = modalId ? antrian.data.find(a => a.id_anggota === modalId) : null;

    return (
        <AdminAnggotaLayout title="Antrian Verifikasi">
            <Head title="Antrian Verifikasi" />

            {flash?.sukses && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
                    {flash.sukses}
                </div>
            )}

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 shadow-md">
                    <h3 className="text-sm text-white/80 mb-1">Menunggu Verifikasi</h3>
                    <p className="text-4xl font-bold text-white">{stats.menunggu || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-[#1B8A3A] to-[#146830] rounded-2xl p-5 shadow-md">
                    <h3 className="text-sm text-white/80 mb-1">Diterima Hari Ini</h3>
                    <p className="text-4xl font-bold text-white">{stats.diterima || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 shadow-md">
                    <h3 className="text-sm text-white/80 mb-1">Ditolak Hari Ini</h3>
                    <p className="text-4xl font-bold text-white">{stats.ditolak || 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Daftar Pengajuan Anggota</h2>
                        <p className="text-sm text-gray-400 mt-0.5">Pengajuan anggota yang memerlukan verifikasi</p>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Cari nama pengajuan..."
                            className="pl-11 pr-4 py-2.5 text-base border border-gray-200 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                            value={dataForm.searchTerm}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {antrian.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                        <ClipboardList size={40} className="mb-3" />
                        <p className="text-base italic">Tidak ada antrian verifikasi saat ini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-base">
                            <thead>
                                <tr className="border-b-2 border-emerald-200 bg-emerald-100/80">
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Nama</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Tanggal Daftar</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Status</th>
                                    <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {antrian.data.map((item) => (
                                    <tr key={item.id_anggota} className="border-b border-emerald-100 hover:bg-emerald-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                        <td className="px-4 py-3 text-gray-500">{item.tanggal_daftar}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                {item.status_keanggotaan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => setModalId(item.id_anggota)}
                                                    className="px-4 py-1.5 rounded-lg bg-[#1B8A3A] hover:bg-[#157030] text-white text-sm font-semibold transition"
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
                {antrian.last_page > 1 && (
                    <div className="flex justify-center gap-1 border-t border-gray-100 px-4 py-4">
                        {antrian.links.map((l, i) => (
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
                    <ModalVerifikasi anggota={anggotaDetail} onTutup={() => setModalId(null)} />
                </Suspense>
            )}
        </AdminAnggotaLayout>
    );
}
