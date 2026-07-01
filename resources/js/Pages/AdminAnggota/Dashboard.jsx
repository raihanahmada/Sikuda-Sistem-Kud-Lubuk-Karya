import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

// ===== PENERAPAN MATERI: Reusable Component Card — Dashboard (Pertemuan 5) =====
function StatCard({ title, value, footer, color }) {
    return (
        <div className={`${color} text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40`}>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                    {title}
                </p>
                <h3 className="text-4xl font-extrabold mt-1">{value}</h3>
            </div>
            <span className="text-xs font-semibold opacity-80 z-10">{footer}</span>
            <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-white/10 rounded-full" />
        </div>
    );
}
// ===== AKHIR CHILD COMPONENT StatCard =====

export default function Dashboard({
    stats = {
        total_anggota: 0,
        aktif: 0,
        pasif: 0,
        anggota_baru: 0,
        menunggu_verifikasi: 0,
    },
    grafikData = [],
    aktivitas = [],
}) {
    const [activeTab, setActiveTab] = useState('Bulanan');

    // ===== PENERAPAN MATERI: useEffect (Pertemuan 11) =====
    // Jenis: Dengan Dependency Array Kosong []
    // Artinya: hanya dijalankan 1x saat komponen pertama kali dimuat (mount)
    // Fungsi: menjalankan interval jam setiap 1 detik
    // Cleanup: clearInterval dijalankan saat komponen hilang (unmount)
    // — ini adalah contoh "efek harus dibersihkan saat komponen hilang" dari modul
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer); // cleanup function
    }, []); // dependency array kosong = jalankan sekali saat mount
    // ===== AKHIR PENERAPAN useEffect =====

    const formatDayDate = (date) => date.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const formatTime = (date) => date.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }) + ' (Waktu Lokal)';

    const warnaAktivitas = (jenis) => {
        if (jenis === 'Verifikasi') return 'bg-emerald-50';
        if (jenis === 'Pendaftaran') return 'bg-blue-50';
        return 'bg-red-50';
    };

    return (
        <AdminAnggotaLayout title="Dashboard">
            <Head title="Dashboard Admin Anggota - SIKUDA" />

            <div className="space-y-6">

                {/* KARTU STATISTIK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#FFB800] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Anggota</p>
                            <h3 className="text-4xl font-extrabold mt-1">{stats.total_anggota}</h3>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold border-t border-white/20 pt-3 z-10">
                            <span>Aktif : <strong className="text-sm ml-1">{stats.aktif}</strong></span>
                            <span>Pasif : <strong className="text-sm ml-1">{stats.pasif}</strong></span>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-white/10 rounded-full" />
                    </div>

                    {/* ===== PENERAPAN MATERI: Parent memanggil StatCard (Pertemuan 5) ===== */}
                    <StatCard
                        title="Anggota Baru (Bulan Ini)"
                        value={stats.anggota_baru}
                        footer={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        color="bg-[#1E75FF]"
                    />
                    <StatCard
                        title="Status Menunggu Verifikasi"
                        value={stats.menunggu_verifikasi}
                        footer="Permohonan Baru"
                        color="bg-[#FF3B30]"
                    />
                    {/* ================================================================ */}
                </div>

                {/* QUICK ACTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 px-6 py-4 rounded-xl shadow-sm text-sm font-semibold text-gray-700">
                        👤➕ Input Calon Anggota
                    </button>
                    <button className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 px-6 py-4 rounded-xl shadow-sm text-sm font-semibold text-gray-700">
                        📤 Verifikasi Berkas
                    </button>
                    <button className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 px-6 py-4 rounded-xl shadow-sm text-sm font-semibold text-gray-700">
                        🖨️ Cetak Laporan Anggota
                    </button>
                </div>

                {/* AKTIVITAS & GRAFIK */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h4 className="text-emerald-600 font-bold text-sm mb-4">Aktivitas Keanggotaan</h4>
                        <div className="space-y-3">
                            {aktivitas.length > 0 ? (
                                aktivitas.map((item, index) => (
                                    <div key={index} className={`p-3 ${warnaAktivitas(item.jenis)} rounded-xl`}>
                                        <p className="text-xs text-gray-600">
                                            <strong>{item.waktu} — {item.jenis}:</strong>{' '}
                                            {item.jenis === 'Verifikasi' && `${item.nama} diterima sebagai anggota aktif.`}
                                            {item.jenis === 'Pendaftaran' && `${item.nama} masuk antrian verifikasi.`}
                                            {item.jenis === 'Update' && `Status ${item.nama} diubah menjadi ${item.status}.`}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-4">Belum ada aktivitas.</p>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-sm text-gray-800">Grafik Pertumbuhan Anggota</h4>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {['Harian', 'Mingguan', 'Bulanan'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1 rounded-lg text-xs ${
                                            activeTab === tab ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ===== PENERAPAN MATERI: Grafik recharts (Pertemuan 5) ===== */}
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={grafikData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="bulan" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={40} />
                                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                    <Tooltip formatter={(value) => [`${value} anggota`, 'Pendaftar Baru']} />
                                    <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} name="Anggota Baru" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        {/* ================================================================ */}
                    </div>

                </div>

            </div>

            {/* ===== PENERAPAN MATERI: Hasil useEffect — jam realtime yang terupdate setiap detik ===== */}
            <div className="mt-8 flex flex-col items-end text-xs text-gray-400 font-semibold">
                <span>{formatDayDate(currentTime)}</span>
                <span>{formatTime(currentTime)}</span>
            </div>
            {/* ================================================================ */}

        </AdminAnggotaLayout>
    );
}