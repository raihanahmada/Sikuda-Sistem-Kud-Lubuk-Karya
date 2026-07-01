import { useMemo, useState, useEffect, memo } from "react";
import { RefreshCw, AlertCircle, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import MainLayout from "../../layouts/Pemilik/MainLayout";
import { usePage, router, Link } from "@inertiajs/react";

// ─── Static fallback data ──────────────────────────────────────────────────────

const miniChartFallback = [{ v: 40 }, { v: 55 }, { v: 45 }, { v: 62 }, { v: 50 }, { v: 70 }, { v: 60 }, { v: 75 }];

const NAMA_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const NAMA_BULAN_SINGKAT = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function tidakAdaData(value) {
    return value === null || value === undefined || Number(value) === 0;
}

function formatTanggalSingkat(tanggal) {
    if (!tanggal) return "";
    const d = new Date(tanggal);
    if (isNaN(d.getTime())) return tanggal;
    const hari = String(d.getDate()).padStart(2, "0");
    const bulan = NAMA_BULAN_SINGKAT[d.getMonth()];
    const tahun = d.getFullYear();
    return `${hari} ${bulan} ${tahun}`;
}

function formatAngkaSingkat(value) {
    const num = Number(value) || 0;
    const abs = Math.abs(num);
    if (abs >= 1000) {
        const ribu = num / 1000;
        const dibulatkan = Number.isInteger(ribu) ? ribu : ribu.toFixed(1);
        return `${dibulatkan}K`;
    }
    return num.toLocaleString("id-ID");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MiniChart = memo(function MiniChart({ data, color }) {
    return (
        <ResponsiveContainer width="100%" height={32}>
            <LineChart data={data}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
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
                <p className="text-sm font-medium text-red-700">Gagal memuat data dashboard</p>
                <p className="text-[11px] text-red-400">Terjadi kesalahan saat mengambil data. Silakan muat ulang halaman.</p>
            </div>
            <button onClick={onRetry} className="flex items-center gap-1 text-[11px] text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition">
                <RefreshCw size={12} /> Muat Ulang
            </button>
        </div>
    );
}

function NilaiData({ value, prefix = "", suffix = "", className = "" }) {
    if (tidakAdaData(value)) {
        return <span className="text-gray-300 italic text-sm">Belum ada data</span>;
    }
    return (
        <span className={className}>
            {prefix}{Number(value).toLocaleString("id-ID")}{suffix}
        </span>
    );
}

function LihatDetail() {
    return (
        <div className="flex items-center gap-0.5 text-[11px] text-gray-600 font-medium hover:text-gray-800 transition mt-1">
            <span>Lihat detail</span>
            <ChevronRight size={12} />
        </div>
    );
}

// ─── Popup pemilih periode (bulan / rentang tanggal) ──────────────────────────

function PopupPilihBulan({ tahun, bulan, tanggalMulai, tanggalAkhir, onApply, onClose }) {
    const [localTahun, setLocalTahun] = useState(tahun);
    const [localBulan, setLocalBulan] = useState(bulan);
    const [localMulai, setLocalMulai] = useState(tanggalMulai || "");
    const [localAkhir, setLocalAkhir] = useState(tanggalAkhir || "");

    const tahunOptions = useMemo(() => {
        const now = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => now - 4 + i);
    }, []);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-[#1B8A3A]" />
                    <h3 className="text-sm font-semibold text-gray-800">Pilih Periode Bulanan</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">Bulan</label>
                        <select value={localBulan} onChange={(e) => setLocalBulan(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]">
                            {NAMA_BULAN.map((nama, idx) => (
                                <option key={nama} value={idx + 1}>{nama}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">Tahun</label>
                        <select value={localTahun} onChange={(e) => setLocalTahun(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]">
                            {tahunOptions.map((th) => (
                                <option key={th} value={th}>{th}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-4">
                    <p className="text-[11px] text-gray-500 mb-2">Atau pilih rentang tanggal kustom (opsional)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Dari tanggal</label>
                            <input type="date" value={localMulai} onChange={(e) => setLocalMulai(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]" />
                        </div>
                        <div>
                            <label className="text-[11px] text-gray-500 mb-1 block">Sampai tanggal</label>
                            <input type="date" value={localAkhir} onChange={(e) => setLocalAkhir(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 transition-colors">
                        Batal
                    </button>
                    <button onClick={() => onApply({ tahun: localTahun, bulan: localBulan, tanggalMulai: localMulai || null, tanggalAkhir: localAkhir || null })} className="flex-1 text-sm font-semibold text-white bg-[#1B8A3A] hover:bg-[#157030] rounded-xl py-2.5 transition-colors">
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
    const { ringkasanKas, totalSimpanan, statistikAnggota, grafikArusKas, ringkasanTbs } = usePage().props;

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // ── State periode grafik ───────────────────────────────────────────────
    const now = new Date();
    const [jenisPeriode, setJenisPeriode] = useState("bulan"); // "bulan" | "tahun"
    const [tahunDipilih, setTahunDipilih] = useState(now.getFullYear());
    const [bulanDipilih, setBulanDipilih] = useState(now.getMonth() + 1);
    const [tanggalMulai, setTanggalMulai] = useState(null);
    const [tanggalAkhir, setTanggalAkhir] = useState(null);
    const [showPopupBulan, setShowPopupBulan] = useState(false);

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
        muatUlangGrafik({ jenisPeriode, tahunDipilih, bulanDipilih, tanggalMulai, tanggalAkhir });
    };

    // ── Muat ulang data grafik sesuai periode yang dipilih ─────────────────
    function muatUlangGrafik({ jenisPeriode, tahunDipilih, bulanDipilih, tanggalMulai, tanggalAkhir }) {
        router.reload({
            data: {
                periode: jenisPeriode,
                tahun: tahunDipilih,
                bulan: jenisPeriode === "bulan" ? bulanDipilih : undefined,
                tanggal_mulai: tanggalMulai || undefined,
                tanggal_akhir: tanggalAkhir || undefined,
            },
            only: ["ringkasanKas", "totalSimpanan", "statistikAnggota", "grafikArusKas", "ringkasanTbs"],
        });
    }

    const pilihPerTahun = () => {
        setJenisPeriode("tahun");
        setTanggalMulai(null);
        setTanggalAkhir(null);
        muatUlangGrafik({ jenisPeriode: "tahun", tahunDipilih, bulanDipilih, tanggalMulai: null, tanggalAkhir: null });
    };

    const bukaPopupBulan = () => {
        setShowPopupBulan(true);
    };

    const terapkanPilihanBulan = ({ tahun, bulan, tanggalMulai, tanggalAkhir }) => {
        setJenisPeriode("bulan");
        setTahunDipilih(tahun);
        setBulanDipilih(bulan);
        setTanggalMulai(tanggalMulai);
        setTanggalAkhir(tanggalAkhir);
        setShowPopupBulan(false);
        muatUlangGrafik({ jenisPeriode: "bulan", tahunDipilih: tahun, bulanDipilih: bulan, tanggalMulai, tanggalAkhir });
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

    // ── Mini chart Penjualan TBS ───────────────────────────────────────────
    const miniChartTbsData = useMemo(() =>
        ringkasanTbs?.grafik?.length
            ? ringkasanTbs.grafik.map((d) => ({ v: d.total_nilai || d.nilai || 0 }))
            : miniChartFallback,
    [ringkasanTbs]);

    // ── Judul grafik dinamis sesuai periode yang sedang ditampilkan ───────
    const judulGrafik = useMemo(() => {
        if (jenisPeriode === "tahun") {
            return `Tren Arus Kas Tahun ${tahunDipilih}`;
        }
        if (tanggalMulai && tanggalAkhir) {
            return `Tren Arus Kas ${formatTanggalSingkat(tanggalMulai)} s.d. ${formatTanggalSingkat(tanggalAkhir)}`;
        }
        return `Tren Arus Kas Bulan ${NAMA_BULAN[bulanDipilih - 1]} ${tahunDipilih}`;
    }, [jenisPeriode, tahunDipilih, bulanDipilih, tanggalMulai, tanggalAkhir]);

    const saldoFormatted = useMemo(
        () => formatAngkaSingkat(ringkasanKas?.saldoAkhir || 0),
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                {isLoading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        {/* ── Kas ── */}
                        <Link href="/pemilik/kas" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-emerald-100 rounded-2xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-600 font-medium mb-1">Saldo Kas Pusat</p>
                                    <p className="text-xl font-bold text-emerald-800 mb-2">
                                        <NilaiData value={ringkasanKas?.saldoAkhir} prefix="Rp " className="text-xl font-bold text-emerald-800" />
                                    </p>
                                    <p className="text-[11px] text-gray-600">
                                        Kas Masuk:&nbsp;
                                        <NilaiData value={ringkasanKas?.totalMasuk} prefix="Rp " className="text-[11px] font-medium text-gray-800" />
                                    </p>
                                    <p className="text-[11px] text-gray-600 mb-1">
                                        Kas Keluar:&nbsp;
                                        <NilaiData value={ringkasanKas?.totalKeluar} prefix="Rp " className="text-[11px] font-medium text-gray-800" />
                                    </p>
                                    <LihatDetail />
                                </div>
                                <MiniChart data={miniChartData} color="#1B8A3A" />
                            </div>
                        </Link>

                        {/* ── Simpanan ── */}
                        <Link href="/pemilik/simpanan" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-amber-100 rounded-2xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-600 font-medium mb-1">Total Dana Simpanan</p>
                                    <p className="text-xl font-bold text-amber-800 mb-2">
                                        <NilaiData value={totalSimpanan} prefix="Rp " className="text-xl font-bold text-amber-800" />
                                    </p>
                                    <p className="text-[11px] text-gray-600">
                                        Dana Masuk:&nbsp;
                                        <NilaiData value={ringkasanKas?.totalMasuk} prefix="Rp " className="text-[11px] font-medium text-gray-800" />
                                    </p>
                                    <p className="text-[11px] text-gray-600 mb-1">
                                        Dana Keluar:&nbsp;
                                        <NilaiData value={ringkasanKas?.totalKeluar} prefix="Rp " className="text-[11px] font-medium text-gray-800" />
                                    </p>
                                    <LihatDetail />
                                </div>
                                <MiniChart data={miniChartData} color="#F59E0B" />
                            </div>
                        </Link>

                        {/* ── Penjualan TBS ── */}
                        <Link href="/pemilik/penjualan-tbs" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-lime-100 rounded-2xl p-4 border border-lime-200 shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-600 font-medium mb-1">Penjualan TBS</p>
                                    <p className="text-xl font-bold text-lime-800 mb-2">
                                        <NilaiData value={ringkasanTbs?.totalNilai} prefix="Rp " className="text-xl font-bold text-lime-800" />
                                    </p>
                                    <p className="text-[11px] text-gray-600">
                                        Berat Total:&nbsp;
                                        <NilaiData value={ringkasanTbs?.totalBeratKg} suffix=" kg" className="text-[11px] font-medium text-gray-800" />
                                    </p>
                                    <p className="text-[11px] text-gray-600 mb-1">
                                        Harga/kg:&nbsp;
                                        <NilaiData value={ringkasanTbs?.hargaBerlaku} prefix="Rp " className="text-[11px] font-medium text-gray-800" />
                                    </p>
                                    <LihatDetail />
                                </div>
                                <MiniChart data={miniChartTbsData} color="#65A30D" />
                            </div>
                        </Link>

                        {/* ── Anggota ── */}
                        <Link href="/pemilik/anggota" className="block h-full">
                            <div className="h-full flex flex-col justify-between bg-blue-100 rounded-2xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition cursor-pointer">
                                <div>
                                    <p className="text-[11px] text-gray-600 font-medium mb-1">Status Keanggotaan</p>
                                    <p className="text-xl font-bold text-blue-800 mb-1">
                                        {total > 0 ? `${total} Orang` : <span className="text-gray-400 italic text-sm">Belum ada data</span>}
                                    </p>
                                    <LihatDetail />
                                </div>

                                {/* Bar chart anggota */}
                                <div className="flex items-end gap-2 h-10 mt-3">
                                    {barAnggota.map(({ pct, color, label }) => (
                                        <div key={label} className="flex flex-col items-center gap-1 flex-1">
                                            <div className="w-full rounded-t transition-all duration-500" style={{ height: pct > 0 ? `${pct}%` : undefined, minHeight: pct > 0 ? 8 : 4, background: color, opacity: pct > 0 ? 1 : 0.25 }} />
                                            <span className="text-[10px] text-gray-600 font-medium">{label}</span>
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
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <p className="text-sm font-semibold text-gray-700">{judulGrafik}</p>

                    <div className="flex items-center gap-4">
                        {/* Toggle Per Bulan / Per Tahun */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1 text-xs font-medium">
                            <button onClick={bukaPopupBulan} className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${jenisPeriode === "bulan" ? "bg-white text-[#1B8A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                <Calendar size={12} />
                                Per Bulan
                                <ChevronDown size={11} />
                            </button>
                            <button onClick={pilihPerTahun} className={`px-3 py-1.5 rounded-md transition-colors ${jenisPeriode === "tahun" ? "bg-white text-[#1B8A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                Per Tahun
                            </button>
                        </div>

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
                </div>

                {grafikData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[380px] text-gray-300">
                        <AlertCircle size={32} className="mb-2" />
                        <p className="text-sm italic">Belum ada data transaksi</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={380}>
                        <AreaChart data={grafikData}>
                            <defs>
                                <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1B8A3A" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#1B8A3A" stopOpacity={0.02} />
                                </linearGradient>
                                <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="tanggal" tickFormatter={formatTanggalSingkat} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={formatAngkaSingkat} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                itemStyle={{ color: "#374151" }}
                                labelFormatter={formatTanggalSingkat}
                                formatter={(value, name) => [`Rp ${formatAngkaSingkat(value)}`, name]}
                            />
                            <Area type="monotone" dataKey="pemasukan" stroke="#1B8A3A" strokeWidth={2} fill="url(#gradMasuk)" />
                            <Area type="monotone" dataKey="pengeluaran" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#gradKeluar)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Popup pemilih bulan / rentang tanggal */}
            {showPopupBulan && (
                <PopupPilihBulan tahun={tahunDipilih} bulan={bulanDipilih} tanggalMulai={tanggalMulai} tanggalAkhir={tanggalAkhir} onApply={terapkanPilihanBulan} onClose={() => setShowPopupBulan(false)} />
            )}
        </MainLayout>
    );
}
