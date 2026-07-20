import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const PERIODE = [
    { key: 'harian',   label: 'Harian' },
    { key: 'mingguan', label: 'Mingguan' },
    { key: 'bulanan',  label: 'Bulanan' },
];

export default function GrafikArusKas({ periode }) {
    const { grafik } = usePage().props;
    const [memuat, setMemuat] = useState(false);

    const gantiPeriode = (key) => {
        if (key === periode) return; // hindari reload sia-sia
        router.reload({
            only: ['grafik', 'periode'],
            data: { periode: key },
            preserveState: true,  // <- pertahankan state React lokal
            preserveScroll: true, // <- jangan loncat ke atas
            onStart:  () => setMemuat(true),
            onFinish: () => setMemuat(false),
        });
    };

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Grafik Arus Kas</h2>
                <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs dark:bg-gray-800">
                    {PERIODE.map((p) => (
                        <button key={p.key} onClick={() => gantiPeriode(p.key)} disabled={memuat}
                            className={`rounded-md px-3 py-1 font-medium transition disabled:opacity-50 ${
                                periode === p.key ? 'bg-white text-green-700 shadow-sm dark:bg-gray-900 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grafik lama TETAP tampil; saat memuat hanya diredupkan + spinner */}
            <div className="relative">
                <div className={`transition-opacity duration-200 ${memuat ? 'opacity-40' : 'opacity-100'}`}>
                    <ResponsiveContainer width="100%" height={256}>
                        <AreaChart data={grafik ?? []}>
                            <defs>
                                <linearGradient id="masuk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="keluar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                            <Tooltip formatter={(v) => new Intl.NumberFormat('id-ID').format(v)} />
                            <Legend />
                            <Area type="monotone" dataKey="pemasukan"   name="Pemasukan"   stroke="#3b82f6" fill="url(#masuk)"  strokeWidth={2} />
                            <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#ef4444" fill="url(#keluar)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {memuat && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                    </div>
                )}
            </div>
        </div>
    );
}
