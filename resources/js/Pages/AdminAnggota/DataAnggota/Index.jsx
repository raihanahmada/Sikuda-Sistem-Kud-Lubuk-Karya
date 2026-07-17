import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link, router } from '@inertiajs/react';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Search, Plus, Users } from 'lucide-react';

const ModalDataAnggota = lazy(() => import('@/Components/Anggota/ModalDataAnggota'));

// ===== PENERAPAN MATERI: Component Parent-Child (Pertemuan 2) =====
const STATUS_STYLE = {
    aktif:  { label: 'AKTIF',  bg: '#E8F5E9', color: '#1B8A3A', dot: '#1B8A3A' },
    pasif:  { label: 'PASIF',  bg: '#FEF3C7', color: '#B45309', dot: '#D97706' },
    keluar: { label: 'KELUAR', bg: '#FEE2E2', color: '#B91C1C', dot: '#DC2626' },
};

// Warna baris tabel disesuaikan status, supaya keaktifan anggota langsung kelihatan sekilas
const ROW_TINT = {
    aktif:  'bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-100',
    pasif:  'bg-amber-50/50 hover:bg-amber-100/60 border-amber-100',
    keluar: 'bg-red-50/50 hover:bg-red-100/60 border-red-100',
};

function StatusBadge({ status }) {
    const s = STATUS_STYLE[status] || { label: status.toUpperCase(), bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' };
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: s.bg, color: s.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
            {s.label}
        </span>
    );
}
// ===== AKHIR CHILD COMPONENT =====

export default function Index({ dataAnggota = { data: [], links: [] }, filters = {}, flash = {} }) {
    const [statusFilter, setStatusFilter] = useState('');

    // ===== PENERAPAN MATERI: Data JSON Search & Filter (Pertemuan 4) =====
    const [dataForm, setDataForm] = useState({
        searchTerm: filters.search || '',
    });
    const isFirstRender = useRef(true);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({ ...dataForm, [name]: value });
    };
    // ===== AKHIR STATE SEARCH =====

    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        const timer = setTimeout(() => {
            router.get(
                '/admin-anggota/data-anggota',
                { search: dataForm.searchTerm, status: statusFilter },
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [dataForm.searchTerm]);

    const handleFilterChange = (e) => {
        const selectedStatus = e.target.value;
        setStatusFilter(selectedStatus);
        router.get('/admin-anggota/data-anggota',
            { status: selectedStatus, search: dataForm.searchTerm },
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus anggota ini? Sistem akan menolak jika anggota memiliki transaksi aktif sesuai aturan SKPL.')) {
            router.delete(`/admin-anggota/data-anggota/${id}`, { preserveScroll: true });
        }
    };

    // ===== Modal popup in-place (gaya sama seperti Kas Harian) =====
    const [modalId, setModalId] = useState(null);
    const anggotaEdit = modalId ? dataAnggota.data.find(a => a.id_anggota === modalId) : null;

    return (
        <AdminAnggotaLayout title="Data Anggota">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">Data Anggota Koperasi</h1>
                    <p className="text-sm text-gray-400">KUD Lubuk Karya</p>
                </div>
                <Link
                    href="/admin-anggota/pendaftaran-anggota/create"
                    className="inline-flex items-center justify-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition"
                >
                    <Plus size={18} />
                    Tambah Anggota Lama
                </Link>
            </div>

            {flash?.sukses && (
                <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
                    {flash.sukses}
                </div>
            )}

            {/* FILTER & SEARCH */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        name="searchTerm"
                        placeholder="Cari nama atau NIK..."
                        className="w-full pl-11 pr-4 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                        value={dataForm.searchTerm}
                        onChange={handleChange}
                    />
                </div>

                <select
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                    value={statusFilter}
                    onChange={handleFilterChange}
                >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="pasif">Pasif</option>
                    <option value="keluar">Keluar</option>
                </select>
            </div>

            {/* TABEL */}
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                {dataAnggota.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                        <Users size={40} className="mb-3" />
                        <p className="text-base italic">Tidak ada data anggota ditemukan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-base">
                            <thead>
                                <tr className="border-b-2 border-emerald-200 bg-emerald-100/80">
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">No</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">NIK</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">Nama Lengkap</th>
                                    <th className="text-left text-sm text-emerald-800 font-semibold px-4 py-3">No HP</th>
                                    <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3">Status</th>
                                    <th className="text-center text-sm text-emerald-800 font-semibold px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataAnggota.data.map((item, index) => (
                                    <tr key={item.id_anggota} className={`border-b transition ${ROW_TINT[item.status_keanggotaan] || 'border-gray-50 hover:bg-gray-50'}`}>
                                        <td className="px-4 py-3 text-gray-500">{(dataAnggota.current_page - 1) * dataAnggota.per_page + index + 1}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.nik}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{item.nama_lengkap}</td>
                                        <td className="px-4 py-3 text-gray-500">{item.no_telepon || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={item.status_keanggotaan} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setModalId(item.id_anggota)}
                                                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-amber-600 bg-amber-50 border border-amber-100 hover:bg-amber-100 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id_anggota)}
                                                    className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition"
                                                >
                                                    Hapus
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
                {dataAnggota.last_page > 1 && (
                    <div className="flex justify-center gap-1 border-t border-gray-100 px-4 py-4">
                        {dataAnggota.links.map((l, i) => (
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

            {/* FOOTER COUNT */}
            <p className="text-sm text-gray-400 mt-3 text-right">
                Menampilkan {dataAnggota.data.length} dari {dataAnggota.total} anggota
            </p>

            {anggotaEdit && (
                <Suspense fallback={null}>
                    <ModalDataAnggota data={anggotaEdit} onTutup={() => setModalId(null)} />
                </Suspense>
            )}
        </AdminAnggotaLayout>
    );
}
