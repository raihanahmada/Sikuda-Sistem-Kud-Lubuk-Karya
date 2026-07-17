import React, { useState, useEffect, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, AlertCircle } from 'lucide-react';

// ===== PENERAPAN MATERI: Reusable Component Card — Dashboard (Pertemuan 5) =====
function StatCard({ title, value, footer, bg, children }) {
    return (
        <div className={`h-40 flex flex-col justify-between rounded-2xl p-5 shadow-md hover:shadow-lg transition text-white ${bg}`}>
            <div>
                <p className="text-sm text-white/80 mb-1">{title}</p>
                <h3 className="text-4xl font-bold text-white">{value}</h3>
            </div>
            {children || <span className="text-sm text-white/80">{footer}</span>}
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
    grafikPertumbuhan = [],
    aktivitas = [],
}) {
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
        if (jenis === 'Verifikasi') return 'bg-emerald-50/60 border-emerald-100';
        if (jenis === 'Pendaftaran') return 'bg-blue-50/60 border-blue-100';
        return 'bg-red-50/60 border-red-100';
    };

    // ── Komposisi status anggota (persentase, untuk mini bar chart) ────────
    const { aktifPercent, pasifPercent, lainnyaPercent } = useMemo(() => {
        const total   = stats.total_anggota || 0;
        const aktif   = stats.aktif || 0;
        const pasif   = stats.pasif || 0;
        const lainnya = Math.max(total - aktif - pasif, 0);
        return {
            aktifPercent:   total > 0 ? (aktif   / total) * 100 : 0,
            pasifPercent:   total > 0 ? (pasif   / total) * 100 : 0,
            lainnyaPercent: total > 0 ? (lainnya / total) * 100 : 0,
        };
    }, [stats]);

    const barAnggota = [
        { pct: aktifPercent,   color: '#FFFFFF',            label: 'Aktif'   },
        { pct: pasifPercent,   color: '#FDE68A',            label: 'Pasif'   },
        { pct: lainnyaPercent, color: 'rgba(255,255,255,0.45)', label: 'Lainnya' },
    ];

    return (
        <AdminAnggotaLayout title="Dashboard">
            <Head title="Dashboard Admin Anggota - SIKUDA" />

            <div className="space-y-4">

                {/* KARTU STATISTIK */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard
                        title="Total Anggota"
                        value={stats.total_anggota}
                        bg="bg-gradient-to-br from-[#1B8A3A] to-[#146830]"
                    >
                        <div className="flex items-end gap-2 h-10 mt-1">
                            {barAnggota.map(({ pct, color, label }) => (
                                <div key={label} className="flex flex-col items-center gap-1 flex-1">
                                    <div
                                        className="w-full rounded-t transition-all duration-500"
                                        style={{ height: pct > 0 ? `${pct}%` : undefined, minHeight: pct > 0 ? 8 : 4, background: color, opacity: pct > 0 ? 1 : 0.25 }}
                                    />
                                    <span className="text-[10px] text-white/80">{label}</span>
                                </div>
                            ))}
                        </div>
                    </StatCard>
                    <StatCard
                        title="Anggota Baru (Bulan Ini)"
                        value={stats.anggota_baru}
                        footer={new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        bg="bg-gradient-to-br from-blue-500 to-blue-700"
                    />
                    <StatCard
                        title="Status Menunggu Verifikasi"
                        value={stats.menunggu_verifikasi}
                        footer="Permohonan Baru"
                        bg="bg-gradient-to-br from-amber-500 to-amber-600"
                    />
                </div>

                {/* ===== PENERAPAN MATERI: Grafik gaya sama seperti Grafik Arus Kas di Pemilik/Dashboard.jsx (AreaChart + gradient) ===== */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <p className="text-sm font-semibold text-gray-700">Grafik Pertumbuhan Anggota</p>

                        <div className="flex items-center gap-4 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#1B8A3A] inline-block" />{' '}
                                Aktif
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#D97706] inline-block" />{' '}
                                Pasif
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#DC2626] inline-block" />{' '}
                                Keluar
                            </span>
                        </div>
                    </div>

                    {grafikPertumbuhan.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[380px] text-gray-300">
                            <AlertCircle size={32} className="mb-2" />
                            <p className="text-sm italic">Belum ada data pendaftaran anggota</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={380}>
                            <AreaChart data={grafikPertumbuhan}>
                                <defs>
                                    <linearGradient id="gradAktif" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1B8A3A" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#1B8A3A" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradPasif" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} itemStyle={{ color: '#374151' }} />
                                <Area type="monotone" dataKey="aktif" stroke="#1B8A3A" strokeWidth={2} fill="url(#gradAktif)" name="Aktif" />
                                <Area type="monotone" dataKey="pasif" stroke="#D97706" strokeWidth={1.5} fill="url(#gradPasif)" name="Pasif" />
                                <Area type="monotone" dataKey="keluar" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gradKeluar)" name="Keluar" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
                {/* ================================================================ */}

                {/* AKTIVITAS KEANGGOTAAN */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 className="text-base font-semibold text-gray-700 mb-4">Aktivitas Keanggotaan</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {aktivitas.length > 0 ? (
                            aktivitas.map((item, index) => (
                                <div key={index} className={`p-3 rounded-xl border ${warnaAktivitas(item.jenis)}`}>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        <strong className="text-gray-800">{item.waktu} — {item.jenis}:</strong>{' '}
                                        {item.jenis === 'Verifikasi' && `${item.nama} diterima sebagai anggota aktif.`}
                                        {item.jenis === 'Pendaftaran' && `${item.nama} masuk antrian verifikasi.`}
                                        {item.jenis === 'Update' && `Status ${item.nama} diubah menjadi ${item.status}.`}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="sm:col-span-2 flex flex-col items-center justify-center py-10 text-gray-300">
                                <Users size={28} className="mb-2" />
                                <p className="text-sm italic">Belum ada aktivitas.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ===== PENERAPAN MATERI: Hasil useEffect — jam realtime yang terupdate setiap detik ===== */}
            <div className="mt-6 flex flex-col items-end text-sm text-gray-400 font-medium">
                <span>{formatDayDate(currentTime)}</span>
                <span>{formatTime(currentTime)}</span>
            </div>
            {/* ================================================================ */}

        </AdminAnggotaLayout>
    );
}
