import { lazy, Suspense } from 'react';
import { Deferred } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';
import RingkasanKeuangan from '@/Components/Keuangan/RingkasanKeuangan';
import AksiCepat from '@/Components/Keuangan/AksiCepat';
import TransaksiTerbaru from '@/Components/Keuangan/TransaksiTerbaru';

// React.lazy: chunk recharts dipisah, diunduh hanya saat komponen dipakai
const GrafikArusKas = lazy(() => import('@/Components/Keuangan/GrafikArusKas'));

export default function Dashboard({ ringkasan, transaksiTerbaru, periode }) {
    return (
        <KeuanganLayout title="Dashboard — Keuangan">
            {/* 1. HEADER: Diperkaya dengan sub-judul dan badge statis agar lebih "hidup" */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                        Pantau arus kas dan ringkasan transaksi terbaru Anda hari ini.
                    </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/15 dark:text-emerald-400 dark:ring-emerald-400/20 sm:flex">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Sistem Aktif
                </div>
            </div>

            <div className="space-y-8">
                {/* 2. RINGKASAN: Bungkus dengan background aksen sangat halus */}
                <section className="relative rounded-3xl bg-slate-50/50 p-1 dark:bg-gray-900/40">
                    <RingkasanKeuangan data={ringkasan} />
                </section>

                {/* 3. GRID LAYOUT: Proporsi diubah agar grafik lebih dominan (col-span-8 vs col-span-4) */}
                <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-4 xl:col-span-3">
                        <AksiCepat />
                    </div>

                    <div className="relative flex h-full flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 lg:col-span-8 xl:col-span-9 p-1">
                        {/* Deferred: tunggu DATA grafik | Suspense: tunggu CHUNK recharts */}
                        <Deferred data="grafik" fallback={<GrafikSkeleton />}>
                            <Suspense fallback={<GrafikSkeleton />}>
                                <GrafikArusKas periode={periode} />
                            </Suspense>
                        </Deferred>
                    </div>
                </section>

                {/* 4. TRANSAKSI TERBARU: Diberi grouping visual agar memisah dari elemen atas */}
                <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800">
                    <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4 rounded-t-2xl dark:border-gray-800 dark:bg-gray-900/60">
                        <h2 className="text-base font-semibold text-slate-800 dark:text-gray-100">
                            Riwayat Transaksi Terbaru
                        </h2>
                    </div>
                    <div className="p-6">
                        <TransaksiTerbaru items={transaksiTerbaru} />
                    </div>
                </section>
            </div>
        </KeuanganLayout>
    );
}

// 5. SKELETON UPGRADE: Dibuat menyerupai bar chart sungguhan yang sedang loading
function GrafikSkeleton() {
    return (
        <div className="flex h-72 w-full flex-col justify-between rounded-xl bg-slate-50 p-6 dark:bg-gray-900">
            {/* Header Skeleton */}
            <div className="flex w-full items-center justify-between">
                <div className="h-5 w-1/4 animate-pulse rounded-md bg-slate-200 dark:bg-gray-700" />
                <div className="h-5 w-16 animate-pulse rounded-md bg-slate-200 dark:bg-gray-700" />
            </div>

            {/* Bar Chart Skeleton Loop */}
            <div className="mt-8 flex h-full items-end gap-2 sm:gap-4">
                {[40, 70, 45, 90, 65, 30, 85].map((height, i) => (
                    <div
                        key={i}
                        className="w-full animate-pulse rounded-t-md bg-slate-200/80 dark:bg-gray-700/80"
                        style={{ height: `${height}%` }}
                    />
                ))}
            </div>
        </div>
    );
}
