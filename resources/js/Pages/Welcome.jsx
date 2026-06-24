import { Head, Link } from '@inertiajs/react';
import ladangImg from '../../assets/Ladang.jpg';

const layanan = [
    {
        title: 'Kas Harian',
        desc: 'Pencatatan kas masuk dan keluar koperasi secara harian, transparan dan rapi.',
    },
    {
        title: 'Pembelian',
        desc: 'Pengelolaan transaksi pembelian barang dan pupuk untuk kebutuhan anggota.',
    },
    {
        title: 'Penjualan TBS',
        desc: 'Pencatatan hasil penimbangan Tandan Buah Segar (TBS) anggota melalui unit RAM.',
    },
    {
        title: 'Penyaluran Dana',
        desc: 'Distribusi dana bersih hasil usaha koperasi kepada anggota secara akurat.',
    },
    {
        title: 'Laporan Periodik',
        desc: 'Laporan keuangan mingguan, 15 harian, bulanan, hingga tahunan dalam satu sistem.',
    },
];

export default function Welcome() {
    return (
        <>
            <Head title="Beranda" />

            <div className="min-h-screen bg-white">
                {/* ── Header ── */}
                <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                                KUD
                            </div>
                            <div>
                                <p className="text-sm font-bold leading-tight text-gray-900">
                                    KUD Lubuk Karya
                                </p>
                                <p className="text-[11px] leading-tight text-gray-400">
                                    SIKUDA
                                </p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
                            <a href="#tentang" className="transition hover:text-green-700">
                                Tentang
                            </a>
                            <a href="#layanan" className="transition hover:text-green-700">
                                Layanan
                            </a>
                        </nav>

                        <Link
                            href={route('sikuda.login')}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                        >
                            Masuk
                        </Link>
                    </div>
                </header>

                {/* ── Hero ── */}
                <section className="relative overflow-hidden bg-gray-900">
                    <img
                        src={ladangImg}
                        alt="Kebun sawit KUD Lubuk Karya"
                        className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />

                    <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
                        <span className="rounded-sm bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                            Koperasi Unit Desa Lubuk Karya
                        </span>
                        <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl">
                            Sistem Informasi Koperasi Unit Desa Anggota
                        </h1>
                        <p className="mt-4 max-w-lg text-base text-white/80">
                            SIKUDA membantu KUD Lubuk Karya mengelola kas, pembelian, penjualan TBS,
                            dan penyaluran dana anggota dalam satu sistem yang terpadu dan transparan.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={route('sikuda.login')}
                                className="rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                            >
                                Masuk ke Sistem
                            </Link>
                            <a
                                href="#layanan"
                                className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Pelajari Layanan
                            </a>
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
                        <div className="overflow-hidden rounded-2xl">
                            <img
                                src={ladangImg}
                                alt="Kebun sawit anggota KUD Lubuk Karya"
                                className="h-72 w-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Layanan ── */}
                <section id="layanan" className="bg-gray-50 py-20">
                    <div className="mx-auto max-w-6xl px-6">
                        <h2 className="text-center text-2xl font-bold text-gray-900">
                            Layanan SIKUDA
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-center text-sm text-gray-500">
                            Modul-modul yang tersedia bagi pengurus koperasi untuk mengelola
                            kegiatan harian KUD Lubuk Karya.
                        </p>

                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {layanan.map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
                                >
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="border-t border-gray-100 py-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-gray-400 md:flex-row">
                        <p>&copy; {new Date().getFullYear()} KUD Lubuk Karya. Seluruh hak cipta dilindungi.</p>
                        <p>SIKUDA — Sistem Informasi Koperasi Unit Desa Anggota</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
