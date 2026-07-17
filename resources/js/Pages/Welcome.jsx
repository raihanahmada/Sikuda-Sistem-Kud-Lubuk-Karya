import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck, TrendingUp, Users2,
    Wallet, ShoppingCart, Leaf, Banknote, BarChart2, ArrowRight,
    UserPlus, Users, PiggyBank, Activity,
    Home, FileText,
} from 'lucide-react';
import DaunAbstrak from '../Components/DaunAbstrak';
import FotoSlider from '../Components/FotoSlider';
import sawit1 from '../../assets/Sawit-1.jpg';
import sawit2 from '../../assets/Sawit-2.jpg';
import sawit3 from '../../assets/Sawit-3.jpg';
import sawit4 from '../../assets/Sawit-4.jpg';
import sawit5 from '../../assets/Sawit-5.jpg';

const fotoHero = [sawit1, sawit2, sawit3, sawit4];

const NILAI_UTAMA = [
    { icon: ShieldCheck, label: 'Aman & Terpercaya' },
    { icon: TrendingUp,  label: 'Laporan Real-time' },
    { icon: Users2,      label: 'Transparan untuk Anggota' },
];

const layananKeuangan = [
    {
        title: 'Kas Harian',
        desc: 'Pencatatan kas masuk dan keluar koperasi secara harian, transparan dan rapi.',
        icon: Wallet,
    },
    {
        title: 'Pembelian',
        desc: 'Pengelolaan transaksi pembelian barang dan pupuk untuk kebutuhan anggota.',
        icon: ShoppingCart,
    },
    {
        title: 'Penjualan TBS',
        desc: 'Pencatatan hasil penimbangan Tandan Buah Segar (TBS) anggota melalui unit RAM.',
        icon: Leaf,
    },
    {
        title: 'Penyaluran Dana',
        desc: 'Distribusi dana bersih hasil usaha koperasi kepada anggota secara akurat.',
        icon: Banknote,
    },
    {
        title: 'Laporan Periodik',
        desc: 'Laporan keuangan mingguan, 15 harian, bulanan, hingga tahunan dalam satu sistem.',
        icon: BarChart2,
    },
];

const layananAnggota = [
    {
        title: 'Pendaftaran Anggota',
        desc: 'Pendaftaran calon anggota baru koperasi secara online, cepat dan mudah dipantau.',
        icon: UserPlus,
    },
    {
        title: 'Verifikasi Anggota',
        desc: 'Peninjauan dan persetujuan berkas pendaftaran anggota oleh pengurus koperasi.',
        icon: ShieldCheck,
    },
    {
        title: 'Data Anggota',
        desc: 'Pengelolaan data lengkap seluruh anggota koperasi dalam satu sistem terpusat.',
        icon: Users,
    },
    {
        title: 'Simpanan Anggota',
        desc: 'Pencatatan simpanan pokok, wajib, dan sukarela anggota secara transparan.',
        icon: PiggyBank,
    },
    {
        title: 'Pelacakan Aktivitas',
        desc: 'Pemantauan riwayat aktivitas dan transaksi anggota koperasi secara real-time.',
        icon: Activity,
    },
];

const layananPemilik = [
    {
        title: 'Dasbor Utama',
        desc: 'Ringkasan kinerja dan kondisi koperasi secara real-time dalam satu tampilan terpusat.',
        icon: Home,
    },
    {
        title: 'Laporan Periodik',
        desc: 'Laporan performa koperasi mingguan, bulanan, hingga tahunan untuk pengambilan keputusan.',
        icon: FileText,
    },
    {
        title: 'Analisis Anggota',
        desc: 'Pemantauan data dan perkembangan anggota koperasi secara menyeluruh.',
        icon: Users,
    },
    {
        title: 'Simpanan',
        desc: 'Pemantauan simpanan seluruh anggota koperasi secara transparan.',
        icon: PiggyBank,
    },
    {
        title: 'Kas',
        desc: 'Pemantauan arus kas koperasi secara real-time.',
        icon: Wallet,
    },
];

function LayananGrid({ items }) {
    return (
        <div className="flex flex-wrap justify-center gap-6">
            {items.map(({ title, desc, icon: Icon }) => (
                <div
                    key={title}
                    className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-md sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5E9] text-[#1B8A3A]">
                        <Icon size={19} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {desc}
                    </p>
                </div>
            ))}
        </div>
    );
}

export default function Welcome() {
    return (
        <>
            <Head title="Beranda" />

            <div className="min-h-screen bg-white">
                {/* ── Header ── */}
                <header className="sticky top-0 z-20 border-b border-emerald-100/70 bg-white shadow-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#22A94F] to-[#146830] text-sm font-bold text-white shadow-md shadow-emerald-900/20">
                                K
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-tight text-[#1B5E20]">
                                    KUD Lubuk Karya
                                </p>
                                <p className="text-[11px] leading-tight text-gray-400">
                                    Sistem Informasi Koperasi
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
                                <a
                                    href="#tentang"
                                    className="relative pb-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gray-200 after:transition-colors hover:text-[#1B8A3A] hover:after:bg-[#1B8A3A]"
                                >
                                    Tentang
                                </a>
                                <a
                                    href="#layanan"
                                    className="relative pb-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-gray-200 after:transition-colors hover:text-[#1B8A3A] hover:after:bg-[#1B8A3A]"
                                >
                                    Layanan
                                </a>
                            </nav>

                            <Link
                                href={route('sikuda.login')}
                                className="rounded-xl bg-gradient-to-r from-[#22A94F] to-[#146830] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:from-[#1F9847] hover:to-[#0F5C26]"
                            >
                                Masuk
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#0B3B1E] via-[#123D22] to-[#0F5C26]">
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

                    <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
                        {/* Kolom kiri: teks */}
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 backdrop-blur-md">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                                    K
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-white">
                                    Koperasi Unit Desa Lubuk Karya
                                </span>
                            </div>

                            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white md:text-5xl">
                                Sistem Informasi Koperasi{' '}
                                <span className="bg-gradient-to-r from-lime-300 to-emerald-200 bg-clip-text text-transparent">
                                    Unit Desa Anggota
                                </span>
                            </h1>
                            <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/70 md:text-base">
                                SIKUDA membantu KUD Lubuk Karya mengelola kas, pembelian, penjualan TBS,
                                dan penyaluran dana anggota dalam satu sistem yang terpadu dan transparan.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={route('sikuda.login')}
                                    className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22A94F] to-[#146830] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:from-[#1F9847] hover:to-[#0F5C26]"
                                >
                                    Masuk ke Sistem
                                    <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                                </Link>
                                <a
                                    href="#layanan"
                                    className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
                                >
                                    Pelajari Layanan
                                </a>
                            </div>

                            {/* Nilai utama */}
                            <div className="mt-10 flex flex-wrap gap-2.5">
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

                        {/* Kolom kanan: slider foto kebun sawit */}
                        <div className="relative">
                            <FotoSlider
                                foto={fotoHero}
                                className="h-[320px] w-full rounded-[2rem] border border-white/15 shadow-2xl shadow-emerald-950/40 sm:h-[400px] md:h-[460px] lg:h-[520px]"
                            />

                            {/* Kartu kaca melayang */}
                            <div className="absolute -bottom-6 -left-6 z-10 hidden items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-md sm:flex">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-300 to-emerald-500 shadow-inner">
                                    <Leaf size={20} className="text-emerald-950" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-none text-white">Tumbuh Bersama</p>
                                    <p className="mt-1 text-[11px] text-white/60">Kebun sawit anggota KUD Lubuk Karya</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Tentang ── */}
                <section id="tentang" className="mx-auto max-w-6xl px-6 py-20">
                    <div className="grid gap-10 md:grid-cols-2 md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Tentang KUD Lubuk Karya
                            </h2>
                            <p className="mt-4 text-sm leading-relaxed text-gray-500">
                                KUD Lubuk Karya adalah koperasi unit desa yang menaungi petani sawit
                                dalam pengelolaan hasil kebun, mulai dari penjualan Tandan Buah Segar
                                (TBS), penyediaan kebutuhan pupuk dan barang, hingga penyaluran dana
                                hasil usaha kepada anggota.
                            </p>
                            <p className="mt-3 text-sm leading-relaxed text-gray-500">
                                Melalui SIKUDA, seluruh proses administrasi dan keuangan koperasi
                                dikelola secara digital agar lebih cepat, akurat, dan mudah dipantau
                                oleh pengurus maupun anggota.
                            </p>
                        </div>
                        <div className="overflow-hidden rounded-3xl border border-emerald-100/70 shadow-xl shadow-emerald-900/10">
                            <img
                                src={sawit5}
                                alt="Kebun sawit anggota KUD Lubuk Karya"
                                className="h-72 w-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Layanan ── */}
                <section id="layanan" className="bg-[#F2F4F3] py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <h2 className="text-center text-2xl font-bold text-gray-900">
                            Layanan SIKUDA
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-center text-sm text-gray-500">
                            Modul-modul yang tersedia bagi pengurus koperasi untuk mengelola
                            kegiatan harian KUD Lubuk Karya.
                        </p>

                        <div className="mt-14">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-[#1B8A3A]">
                                    Modul Admin Keuangan
                                </span>
                                <span className="h-px flex-1 bg-gray-200" />
                            </div>
                            <LayananGrid items={layananKeuangan} />
                        </div>

                        <div className="mt-14">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-[#1B8A3A]">
                                    Modul Admin Anggota
                                </span>
                                <span className="h-px flex-1 bg-gray-200" />
                            </div>
                            <LayananGrid items={layananAnggota} />
                        </div>

                        <div className="mt-14">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="h-px flex-1 bg-gray-200" />
                                <span className="text-xs font-semibold uppercase tracking-widest text-[#1B8A3A]">
                                    Modul Pemilik
                                </span>
                                <span className="h-px flex-1 bg-gray-200" />
                            </div>
                            <LayananGrid items={layananPemilik} />
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-gray-100 py-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-gray-400 md:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#22A94F] to-[#146830] text-[10px] font-bold text-white">
                                K
                            </div>
                            <p>&copy; {new Date().getFullYear()} KUD Lubuk Karya. Seluruh hak cipta dilindungi.</p>
                        </div>
                        <p>SIKUDA — Sistem Informasi Koperasi Unit Desa Anggota</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
