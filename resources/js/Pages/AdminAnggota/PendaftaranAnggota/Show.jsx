import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { Link } from '@inertiajs/react';

// Menangkap props 'anggota' yang dikirim dari PendaftaranController
export default function Show({ anggota }) {
    return (
        <AdminAnggotaLayout title="Detail Anggota">
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-2xl font-bold mb-4 border-b pb-3">Detail Pendaftaran Anggota</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-lg">
                    <div>
                        <p className="text-gray-500 text-sm">Nomor Induk Kependudukan (NIK)</p>
                        <p className="font-semibold">{anggota.nik}</p>
                    </div>
                    
                    <div>
                        <p className="text-gray-500 text-sm">Nama Lengkap</p>
                        <p className="font-semibold">{anggota.nama_lengkap}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">Alamat</p>
                        <p className="font-semibold">{anggota.alamat}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">No Telepon</p>
                        <p className="font-semibold">{anggota.no_telepon || '-'}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">Tanggal Daftar</p>
                        <p className="font-semibold">{anggota.tanggal_daftar}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">Nomor Surat Permohonan</p>
                        <p className="font-semibold">{anggota.no_surat_permohonan}</p>
                    </div>

                    <div className="md:col-span-2">
                        <p className="text-gray-500 text-sm">Status Keanggotaan</p>
                        <span className="inline-block mt-1 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {anggota.status_keanggotaan}
                        </span>
                    </div>
                </div>

                <div className="mt-8">
                    <Link
                        href="/admin-anggota/pendaftaran-anggota"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded transition"
                    >
                        ← Kembali
                    </Link>
                </div>
            </div>
        </AdminAnggotaLayout>
    );
}