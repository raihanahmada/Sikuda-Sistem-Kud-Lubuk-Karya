// File: resources/js/Pages/AdminAnggota/DataAnggota/Index.jsx

import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link, router } from '@inertiajs/react';
// ===== PENERAPAN MATERI: Import lazy dan Suspense =====
import { useState, lazy, Suspense } from 'react';

// Meng-import komponen tabel secara dinamis.
// File tabel ini baru akan di-load oleh browser saat baris kode Suspense di bawah dijalankan.
const TableAnggotaLazy = lazy(() => import('@/Components/Anggota/TableAnggota'));
// =======================================================

export default function Index({ dataAnggota = [] }) {
    const [statusFilter, setStatusFilter] = useState('');

    const handleFilterChange = (e) => {
        const selectedStatus = e.target.value;
        setStatusFilter(selectedStatus);
        
        router.get('/admin-anggota/data-anggota', 
            { status: selectedStatus }, 
            { preserveState: true, replace: true }
        );
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus anggota ini? Sistem akan menolak jika anggota memiliki transaksi aktif sesuai aturan SKPL.')) {
            router.delete(`/admin-anggota/data-anggota/${id}`);
        }
    };

    const [dataForm, setDataForm] = useState({
        searchTerm: '',
    });

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setDataForm({
            ...dataForm,
            [name]: value,
        });
    };

    const _searchTerm = dataForm.searchTerm.toLowerCase();
    const hasilPencarian = dataAnggota.filter((item) =>
        item.nama_lengkap.toLowerCase().includes(_searchTerm) ||
        item.nik.includes(_searchTerm)
    );

    return (
        <AdminAnggotaLayout title="Data Anggota">
            <div className="bg-white p-6 rounded-xl shadow">
                
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold">Data Anggota Koperasi</h2>
                    
                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Cari nama atau NIK..."
                            className="border p-2 rounded-lg w-full md:w-64"
                            value={dataForm.searchTerm}
                            onChange={handleChange}
                        />

                        <select 
                            className="border p-2 rounded-lg bg-gray-50"
                            value={statusFilter}
                            onChange={handleFilterChange}
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="pasif">Pasif</option>
                            <option value="keluar">Keluar</option>
                        </select>

                        <Link
                            href="/admin-anggota/pendaftaran-anggota/create"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center"
                        >
                            + Tambah Anggota Lama
                        </Link>
                    </div>
                </div>

                {/* ===== PENERAPAN MATERI: Membungkus komponen Lazy dengan Suspense ===== */}
                {/* Fallback di bawah ini akan tampil berbentuk teks "Memuat data tabel..." 
                    saat browser sedang mengunduh komponen TableAnggotaLazy.
                    Kamu bisa menggantinya dengan animasi spinner/loading yang lebih keren.
                */}
                <Suspense fallback={
                    <div className="py-10 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-2"></div>
                        <p className="text-gray-500 font-medium">Memuat data tabel anggota...</p>
                    </div>
                }>
                    <TableAnggotaLazy 
                        hasilPencarian={hasilPencarian} 
                        handleDelete={handleDelete} 
                    />
                </Suspense>
                {/* ======================================================================= */}

            </div>
        </AdminAnggotaLayout>
    );
}