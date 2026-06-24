import { useMemo } from "react";
import { RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import MainLayout from "../../layouts/Pemilik/MainLayout";
import { usePage, router } from "@inertiajs/react";
import { memo, useState, useEffect } from "react";
import { Link } from "@inertiajs/react";

// ─── Static fallback data ──────────────────────────────────────────────────────

const miniChartFallback = [
    { v: 40 },
    { v: 55 },
    { v: 45 },
    { v: 62 },
    { v: 50 },
    { v: 70 },
    { v: 60 },
    { v: 75 },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function tidakAdaData(value) {
    return value === null || value === undefined || Number(value) === 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MiniChart = memo(function MiniChart({ data, color }) {
    return (
        <ResponsiveContainer width="100%" height={32}>
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse h-full">
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-2 bg-gray-100 rounded w-full mb-1" />
            <div className="h-2 bg-gray-100 rounded w-2/3" />
        </div>
    );
}

function ErrorBanner({ onRetry }) {
    return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                    Gagal memuat data dashboard
                </p>
                <p className="text-[11px] text-red-400">
                    Terjadi kesalahan saat mengambil data. Silakan muat ulang
                    halaman.
                </p>
            </div>
            <button
                onClick={onRetry}
                className="flex items-center gap-1 text-[11px] text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition"
            >
                <RefreshCw size={12} /> Muat Ulang
            </button>
        </div>
    );
}

function NilaiData({ value, prefix = "", suffix = "", className = "" }) {
    if (tidakAdaData(value)) {
        return (
            <span className="text-gray-300 italic text-sm">Belum ada data</span>
        );
    }
    return (
        <span className={className}>
            {prefix}
            {Number(value).toLocaleString("id-ID")}
            {suffix}
        </span>
    );
}

function LihatDetail() {
    return (
        <div className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-gray-600 transition mt-1">
            <span>Lihat detail</span>
            <ChevronRight size={11} />
        </div>
    );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
    const { ringkasanKas, totalSimpanan, statistikAnggota, grafikArusKas } =
        usePage().props;

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        try {
            if (ringkasanKas !== undefined || totalSimpanan !== undefined) {
                setIsLoading(false);
                setHasError(false);
            } else {
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    setHasError(true);
                }, 5000);
                return () => clearTimeout(timer);
            }
        } catch {
            setIsLoading(false);
            setHasError(true);
        }
    }, [ringkasanKas, totalSimpanan]);

    const handleRetry = () => {
        setIsLoading(true);
        setHasError(false);
        router.reload({
            only: [
                "ringkasanKas",
                "totalSimpanan",
                "statistikAnggota",
                "grafikArusKas",
            ],
        });
    };

    // ── Statistik anggota ──────────────────────────────────────────────────
    const { total, aktifPercent, pasifPercent, tidakAktifPercent } = useMemo(() => {
        const total              = statistikAnggota?.total       || 0;
        const anggotaAktif       = statistikAnggota?.aktif       || 0;
        const anggotaPasif       = statistikAnggota?.pasif       || 0;
        const anggotaTidakAktif  = statistikAnggota?.tidak_aktif || 0;
        return {
            total,
            aktifPercent:      total > 0 ? (anggotaAktif      / total) * 100 : 0,
            pasifPercent:      total > 0 ? (anggotaPasif      / total) * 100 : 0,
            tidakAktifPercent: total > 0 ? (anggotaTidakAktif / total) * 100 : 0,
        };
    }, [statistikAnggota]);

    // ── Grafik & mini chart ────────────────────────────────────────────────
    const grafikData = useMemo(() => grafikArusKas || [], [grafikArusKas]);

    const miniChartData = useMemo(() =>
        grafikData.length
            ? grafikData.map((d) => ({ v: d.pemasukan || 0 }))
            : miniChartFallback,
    [grafikData]);

    const judulGrafik = useMemo(() => {
        const now = new Date();
        const bulan = now.toLocaleString("id-ID", { month: "long" });
        const tahun = now.getFullYear();
        return `Tren Arus Kas Bulan ${bulan} ${tahun} (Real-time)`;
    }, []);

    const saldoFormatted = useMemo(
        () => Number(ringkasanKas?.saldoAkhir || 0).toLocaleString("id-ID"),
        [ringkasanKas],
    );

    // ── Bar anggota ────────────────────────────────────────────────────────
    const barAnggota = useMemo(
        () => [
            { pct: aktifPercent,      color: "#1B8A3A", label: "Aktif"     },
            { pct: pasifPercent,      color: "#F59E0B", label: "Pasif"     },
            { pct: tidakAktifPercent, color: "#EF4444", label: "Tdk Aktif" },
        ],
        [aktifPercent, pasifPercent, tidakAktifPercent],
    );

    return (
        <MainLayout>
            {/* Error Banner */}
            {hasError && <ErrorBanner onRetry={handleRetry} />}

            {/* METRIC CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {isLoading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        {/* ── Kas ── */}
                        <Link href="/pemilik/kas" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-white rounded-2xl p-4 border border-gray-100 border-l-4 border-l-[#1B8A3A] shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-1">
                                        Saldo Kas Pusat
                                    </p>
                                    <p className="text-xl font-semibold text-[#1B8A3A] mb-2">
                                        <NilaiData
                                            value={ringkasanKas?.saldoAkhir}
                                            prefix="Rp "
                                            className="text-xl font-semibold text-[#1B8A3A]"
                                        />
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Kas Masuk:&nbsp;
                                        <NilaiData
                                            value={ringkasanKas?.totalMasuk}
                                            prefix="Rp "
                                            className="text-[10px] text-gray-600"
                                        />
                                    </p>
                                    <p className="text-[10px] text-gray-400 mb-1">
                                        Kas Keluar:&nbsp;
                                        <NilaiData
                                            value={ringkasanKas?.totalKeluar}
                                            prefix="Rp "
                                            className="text-[10px] text-gray-600"
                                        />
                                    </p>
                                    <LihatDetail />
                                </div>
                                <MiniChart data={miniChartData} color="#1B8A3A" />
                            </div>
                        </Link>

                        {/* ── Simpanan ── */}
                        <Link href="/pemilik/simpanan" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-white rounded-2xl p-4 border border-gray-100 border-l-4 border-l-[#F59E0B] shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-1">
                                        Total Dana Simpanan
                                    </p>
                                    <p className="text-xl font-semibold text-gray-800 mb-2">
                                        <NilaiData
                                            value={totalSimpanan}
                                            prefix="Rp "
                                            className="text-xl font-semibold text-gray-800"
                                        />
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Dana Masuk:&nbsp;
                                        <NilaiData
                                            value={ringkasanKas?.totalMasuk}
                                            prefix="Rp "
                                            className="text-[10px] text-gray-600"
                                        />
                                    </p>
                                    <p className="text-[10px] text-gray-400 mb-1">
                                        Dana Keluar:&nbsp;
                                        <NilaiData
                                            value={ringkasanKas?.totalKeluar}
                                            prefix="Rp "
                                            className="text-[10px] text-gray-600"
                                        />
                                    </p>
                                    <LihatDetail />
                                </div>
                                <MiniChart data={miniChartData} color="#F59E0B" />
                            </div>
                        </Link>

                        {/* ── Anggota ── */}
                        <Link href="/pemilik/anggota" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-white rounded-2xl p-4 border border-gray-100 border-l-4 border-l-[#3B82F6] shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-400 mb-1">
                                        Status Keanggotaan
                                    </p>
                                    <p className="text-xl font-semibold text-gray-800 mb-1">
                                        {total > 0 ? (
                                            `${total} Orang`
                                        ) : (
                                            <span className="text-gray-300 italic text-sm">
                                                Belum ada data
                                            </span>
                                        )}
                                    </p>
                                    <LihatDetail />
                                </div>

                                {/* Bar chart anggota */}
                                <div className="flex items-end gap-2 h-10 mt-3">
                                    {barAnggota.map(({ pct, color, label }) => (
                                        <div
                                            key={label}
                                            className="flex flex-col items-center gap-1 flex-1"
                                        >
                                            <div
                                                className="w-full rounded-t transition-all duration-500"
                                                style={{
                                                    height: pct > 0 ? `${pct}%` : undefined,
                                                    minHeight: pct > 0 ? 8 : 4,
                                                    background: color,
                                                    opacity: pct > 0 ? 1 : 0.25,
                                                }}
                                            />
                                            <span className="text-[9px] text-gray-400">
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    </>
                )}
            </div>

            {/* GRAFIK ARUS KAS */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-700">
                        {judulGrafik}
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#1B8A3A] inline-block" />{" "}
                            Pemasukan
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{" "}
                            Pengeluaran
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />{" "}
                            Saldo Rp {saldoFormatted}
                        </span>
                    </div>
                </div>

                {grafikData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[380px] text-gray-300">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="text-sm italic">
                            Belum ada data transaksi
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={380}>
                        <AreaChart data={grafikData}>
                            <defs>
                                <linearGradient
                                    id="gradMasuk"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#1B8A3A"
                                        stopOpacity={0.25}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#1B8A3A"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                                <linearGradient
                                    id="gradKeluar"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#EF4444"
                                        stopOpacity={0.15}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#EF4444"
                                        stopOpacity={0.02}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                dataKey="tanggal"
                                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    fontSize: 11,
                                    borderRadius: 8,
                                    border: "1px solid #e5e7eb",
                                }}
                                itemStyle={{ color: "#374151" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="pemasukan"
                                stroke="#1B8A3A"
                                strokeWidth={2}
                                fill="url(#gradMasuk)"
                            />
                            <Area
                                type="monotone"
                                dataKey="pengeluaran"
                                stroke="#EF4444"
                                strokeWidth={1.5}
                                strokeDasharray="4 3"
                                fill="url(#gradKeluar)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </MainLayout>
    );
}
