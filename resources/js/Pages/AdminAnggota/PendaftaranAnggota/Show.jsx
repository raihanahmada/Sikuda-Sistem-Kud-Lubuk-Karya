import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-sm text-gray-400 mb-1 dark:text-gray-500">{label}</p>
            <p className="text-base font-medium text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );
}

// Menangkap props 'anggota' yang dikirim dari PendaftaranController
export default function Show({ anggota }) {
    return (
        <AdminAnggotaLayout title="Detail Anggota">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <Link href="/admin-anggota/pendaftaran-anggota" className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition dark:border-gray-800 dark:hover:bg-gray-800">
                    <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Detail Pendaftaran Anggota</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500">KUD Lubuk Karya</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoItem label="Nomor Induk Kependudukan (NIK)" value={anggota.nik} />
                    <InfoItem label="Nama Lengkap" value={anggota.nama_lengkap} />
                    <InfoItem label="Alamat" value={anggota.alamat} />
                    <InfoItem label="No Telepon" value={anggota.no_telepon || '-'} />
                    <InfoItem label="Tanggal Daftar" value={anggota.tanggal_daftar} />
                    <InfoItem label="Nomor Surat Permohonan" value={anggota.no_surat_permohonan} />

                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-400 mb-1.5 dark:text-gray-500">Status Keanggotaan</p>
                        <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold dark:bg-yellow-900/15 dark:text-yellow-400">
                            {anggota.status_keanggotaan}
                        </span>
                    </div>
                </div>
            </div>
        </AdminAnggotaLayout>
    );
}
