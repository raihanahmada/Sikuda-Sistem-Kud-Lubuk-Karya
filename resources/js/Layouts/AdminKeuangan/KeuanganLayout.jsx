import { Head, Link, router, usePage } from '@inertiajs/react';

const menu = [
    { label: 'Dashboard',       href: '/admin-keuangan/dashboard' },
    { label: 'Kas Harian', href: '/admin-keuangan/kas-harian' }, // UC07 — kas masuk/keluar
    { label: 'Pembelian',       href: '/admin-keuangan/pembelian' }, // UC08 — pembelian barang/pupuk anggota
    { label: 'Penjualan TBS',   href: '/admin-keuangan/penjualan-tbs' }, // UC09 — penimbangan TBS via unit RAM
    { label: 'Penyaluran Dana', href: '/admin-keuangan/penyaluran-dana' }, // UC10 — distribusi dana bersih
    { label: 'Laporan Periodik',href: '/admin-keuangan/laporan' }, // UC11 — mingguan/15 harian/bulanan/tahunan
    { label: 'Pengaturan',         href: '/admin-keuangan/setting' }, // UC12 — ubah nama & password
];

export default function KeuanganLayout({ title, children }) {
    const { url } = usePage();
    const logout = () => router.post(route('sikuda.logout'));

    return (
        <>
            <Head title={title} />
            <div className="flex min-h-screen bg-gray-50">
                <aside className="hidden w-60 flex-col border-r border-gray-100 bg-white px-4 py-6 md:flex print:hidden">
                    <div className="mb-8 flex items-center gap-2 px-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
                            KUD
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">KUD Lubuk Karya</p>
                            <p className="text-[10px] text-gray-400">Panel Admin Keuangan</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {menu.map((m) => {
                            // cocokkan persis untuk dashboard, startsWith untuk modul lain
                            const aktif =
                                m.href !== '#' &&
                                (m.href === '/admin-keuangan/dashboard'
                                    ? url === m.href
                                    : url.startsWith(m.href));
                            return (
                                <Link key={m.label} href={m.href}
                                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        aktif ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50'
                                    }`}>
                                    {m.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button onClick={logout}
                        className="mt-auto rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                        Logout
                    </button>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="flex items-center gap-4 border-b border-gray-100 bg-white px-6 py-3 print:hidden">
                        <button onClick={logout}
                            className="ml-auto rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800">
                            Logout
                        </button>
                    </header>
                    <main className="flex-1 p-6 print:p-0">{children}</main>
                </div>
            </div>
        </>
    );
}
