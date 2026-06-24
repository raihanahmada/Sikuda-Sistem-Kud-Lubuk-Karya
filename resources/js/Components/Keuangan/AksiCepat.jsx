import { Link } from '@inertiajs/react';

export default function AksiCepat() {
    const aksi = [
        { label: 'Catat Kas Masuk',        href: route('admin-keuangan.kas-harian.index', { jenis: 'masuk' }),  warna: 'text-green-600' },
        { label: 'Catat Kas Keluar',       href: route('admin-keuangan.kas-harian.index', { jenis: 'keluar' }), warna: 'text-red-600' },
        { label: 'Pembelian',              href: route('admin-keuangan.pembelian.index'),                       warna: 'text-blue-600' },
        { label: 'Cetak Laporan Keuangan', href: route('admin-keuangan.laporan.index'),                         warna: 'text-gray-700' },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {aksi.map((a) => (
                <Link key={a.label} href={a.href}
                    className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-6 text-center text-sm font-semibold shadow-sm transition hover:border-green-200 hover:shadow">
                    <span className={a.warna}>{a.label}</span>
                </Link>
            ))}
        </div>
    );
}
