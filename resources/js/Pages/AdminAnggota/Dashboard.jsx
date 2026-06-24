import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';

export default function Dashboard({ stats }) {
    const [activeTab, setActiveTab] = useState('Bulanan');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDayDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (date) => {
        return (
            date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }) + ' (Local time)'
        );
    };

    const dataStats = stats || {
        total_anggota: '1.250',
        aktif: '1.100',
        pasif: '150',
        anggota_baru: '45',
        menunggu_verifikasi: '30',
    };

    return (
        <AdminAnggotaLayout title="Dashboard">
            <Head title="Dashboard Admin Anggota - SIKUDA" />

            <div className="space-y-6">

                {/* KARTU STATISTIK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Total Anggota */}
                    <div className="bg-[#FFB800] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                                Total Anggota
                            </p>

                            <h3 className="text-4xl font-extrabold mt-1">
                                {dataStats.total_anggota}
                            </h3>
                        </div>

                        <div className="flex gap-4 text-xs font-semibold border-t border-white/20 pt-3 z-10">
                            <span>
                                Aktif :
                                <strong className="text-sm ml-1">
                                    {dataStats.aktif}
                                </strong>
                            </span>

                            <span>
                                Pasif :
                                <strong className="text-sm ml-1">
                                    {dataStats.pasif}
                                </strong>
                            </span>
                        </div>

                        <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-white/10 rounded-full" />
                    </div>

                    {/* Anggota Baru */}
                    <div className="bg-[#1E75FF] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                                Anggota Baru (Bulan Ini)
                            </p>

                            <h3 className="text-4xl font-extrabold mt-1">
                                {dataStats.anggota_baru}
                            </h3>
                        </div>

                        <span className="text-xs font-semibold opacity-80">
                            Juni 2026
                        </span>

                        <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-white/10 rounded-full" />
                    </div>

                    {/* Menunggu Verifikasi */}
                    <div className="bg-[#FF3B30] text-white p-6 rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                                Status Menunggu Verifikasi
                            </p>

                            <h3 className="text-4xl font-extrabold mt-1">
                                {dataStats.menunggu_verifikasi}
                            </h3>
                        </div>

                        <span className="text-xs font-semibold opacity-80">
                            Permohonan Baru
                        </span>

                        <div className="absolute right-[-10px] bottom-[-10px] w-28 h-28 bg-white/10 rounded-full" />
                    </div>

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

                    {/* Aktivitas */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

                        <h4 className="text-emerald-600 font-bold text-sm mb-4">
                            Aktivitas Keanggotaan
                        </h4>

                        <div className="space-y-3">

                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-gray-600">
                                    <strong>
                                        14:32 - Verifikasi :
                                    </strong>
                                    {' '}
                                    Bapak Selamet diterima sebagai anggota aktif.
                                </p>
                            </div>

                            <div className="p-3 bg-red-50 rounded-xl">
                                <p className="text-xs text-gray-600">
                                    <strong>
                                        13:10 - Update :
                                    </strong>
                                    {' '}
                                    Status Ibu Kartini diubah menjadi pasif.
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <p className="text-xs text-gray-600">
                                    <strong>
                                        11:05 - Pendaftaran :
                                    </strong>
                                    {' '}
                                    Ibu Fera masuk antrian verifikasi.
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Grafik */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">

                        <div className="flex justify-between items-center mb-6">

                            <h4 className="font-bold text-sm text-gray-800">
                                Grafik Pertumbuhan Anggota
                            </h4>

                            <div className="flex bg-gray-100 p-1 rounded-xl">

                                {['Harian', 'Mingguan', 'Bulanan'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1 rounded-lg text-xs ${
                                            activeTab === tab
                                                ? 'bg-white shadow text-gray-800'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}

                            </div>

                        </div>

                        <div className="h-52 flex items-center justify-center text-gray-400">
                            Grafik Pertumbuhan Anggota
                        </div>

                    </div>

                </div>

            </div>

            <div className="mt-8 flex flex-col items-end text-xs text-gray-400 font-semibold">
                <span>{formatDayDate(currentTime)}</span>
                <span>{formatTime(currentTime)}</span>
            </div>

        </AdminAnggotaLayout>
    );
}