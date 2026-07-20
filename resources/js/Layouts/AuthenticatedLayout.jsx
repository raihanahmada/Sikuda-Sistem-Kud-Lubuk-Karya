import { Head } from '@inertiajs/react';
import { ShieldCheck, TrendingUp, Users2, Sprout } from 'lucide-react';
import DaunAbstrak from '../Components/DaunAbstrak';
import ThemeToggle from '../Components/ThemeToggle';

export const NILAI_UTAMA = [
    { icon: ShieldCheck, label: 'Aman & Terpercaya' },
    { icon: TrendingUp,  label: 'Laporan Real-time' },
    { icon: Users2,      label: 'Transparan untuk Anggota' },
];

export default function AuthenticatedLayout({ title, children, status }) {
    return (
        <>
            <Head title={title} />

            <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-[#F2F4F3] via-white to-emerald-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">

                {/* Aksen gradasi dekoratif di latar */}
                <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-[#22A94F]/20 to-[#146830]/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-900/10" />

                {/* ── Kolom Kiri: Form Login ── */}
                <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 md:w-1/2 md:px-10 lg:px-16">
                    <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-emerald-100/70 bg-white/90 shadow-xl shadow-emerald-900/10 backdrop-blur-sm sm:p-10 p-8 dark:border-gray-800 dark:bg-gray-900/90">

                        {/* Brand mark — konsisten dengan badge di sidebar semua role */}
                        <div className="mb-8 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22A94F] to-[#146830] text-lg font-bold text-white shadow-md shadow-emerald-900/20">
                                    K
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#1B5E20] dark:text-emerald-400">KUD Lubuk Karya</p>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">Sistem Informasi Koperasi</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* Status session (misal setelah logout) */}
                        {status && (
                            <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/15 dark:text-green-400">
                                {status}
                            </div>
                        )}

                        {/* Children Form Content */}
                        {children}
                    </div>

                    <p className="relative z-10 mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
                        © {new Date().getFullYear()} KUD Lubuk Karya — Seluruh hak cipta dilindungi.
                    </p>
                </div>

                {/* ── Kolom Kanan: Hero / Branding (ilustrasi custom, bukan foto) ── */}
                <div className="relative hidden w-1/2 items-stretch p-4 md:flex lg:p-6">
                    <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0B3B1E] via-[#123D22] to-[#0F5C26] shadow-2xl shadow-emerald-950/30 ring-1 ring-black/5">

                        {/* Pola titik halus untuk tekstur */}
                        <div
                            className="absolute inset-0 opacity-[0.15]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)',
                                backgroundSize: '24px 24px',
                            }}
                        />

                        {/* Gumpalan gradasi dekoratif */}
                        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-lime-300/20 blur-[90px]" />
                        <div className="pointer-events-none absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-emerald-400/25 blur-[90px]" />
                        <div className="pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-teal-300/15 blur-[100px]" />

                        {/* Motif daun abstrak besar sebagai aksen visual */}
                        <DaunAbstrak className="pointer-events-none absolute -right-10 top-10 h-64 w-64 rotate-12 text-white/[0.06]" />
                        <DaunAbstrak className="pointer-events-none absolute -bottom-16 -left-10 h-72 w-72 -rotate-[20deg] text-white/[0.05]" />
                        <DaunAbstrak className="pointer-events-none absolute bottom-24 right-16 h-24 w-24 rotate-45 text-lime-300/20" />

                        {/* Label kantor di pojok kiri atas */}
                        <div className="relative z-10 flex items-center gap-2.5 p-6">
                            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 backdrop-blur-md">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                                    K
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                                    Kantor KUD Lubuk Karya
                                </span>
                            </div>
                        </div>

                        {/* Kartu kaca melayang — kesan produk modern, tidak kaku */}
                        <div className="relative z-10 mx-8 flex items-center gap-3 self-end rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-md">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 to-emerald-500 shadow-inner">
                                <Sprout size={20} className="text-emerald-950" />
                            </div>
                            <div>
                                <p className="text-lg font-bold leading-none text-white">Tumbuh Bersama</p>
                                <p className="mt-1 text-xs text-white/60">Koperasi digital untuk anggota &amp; pengurus</p>
                            </div>
                        </div>

                        {/* Teks branding */}
                        <div className="relative z-10 px-10 pb-10 pt-6">
                            <h2 className="mb-3 text-4xl font-bold leading-[1.15] tracking-tight text-white">
                                Kelola pekerjaan
                                <br />
                                anda menjadi{' '}
                                <span className="bg-gradient-to-r from-lime-300 to-emerald-200 bg-clip-text text-transparent">
                                    lebih mudah
                                </span>
                            </h2>
                            <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/70">
                                Selamat datang kembali! Masuk untuk mengakses dasbor admin dan laporan harian Anda.
                            </p>

                            {/* Nilai utama */}
                            <div className="flex flex-wrap gap-2.5">
                                {NILAI_UTAMA.map(({ icon: Icon, label }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm"
                                    >
                                        <Icon size={13} className="text-white/80" />
                                        <span className="text-[11px] font-medium text-white/80">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
