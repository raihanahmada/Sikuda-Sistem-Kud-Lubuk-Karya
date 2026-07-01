import { useState, useMemo, useEffect, useRef, memo } from "react";
import MainLayout from "../../layouts/Pemilik/MainLayout";
import { usePage, router, Link } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { ArrowLeft, Search, Calendar, ChevronDown } from "lucide-react";

// ─── Static ───────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;
const DEBOUNCE_MS = 500;

const NAMA_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatRp(value) { return Number(value || 0).toLocaleString("id-ID"); }
function getYearRange(year) { return [`${year}-01-01`, `${year}-12-31`]; }
function formatTanggalIndo(tanggalStr) {
    if (!tanggalStr) return "";
    const d = new Date(tanggalStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Pagination ────────────────────────────────────────────────────────────────

const Pagination = memo(function Pagination({ current, total, onChange }) {
    const pages = Array.from({ length: total }, (_, i) => i + 1);
    return (
        <div className="flex items-center justify-end gap-1.5 mt-4 text-sm text-gray-500">
            <button onClick={() => onChange(Math.max(1, current - 1))} className="w-8 h-8 hover:bg-gray-100 rounded-md">‹</button>
            {pages.map((p) => (
                <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 rounded-md ${p === current ? "border border-emerald-500 text-emerald-600 bg-emerald-50" : "hover:bg-gray-100"}`}>{p}</button>
            ))}
            <button onClick={() => onChange(Math.min(total, current + 1))} className="w-8 h-8 hover:bg-gray-100 rounded-md">›</button>
        </div>
    );
});

// ─── Export Button Group ───────────────────────────────────────────────────────

const ExportButtons = memo(function ExportButtons({ onExport }) {
    return (
        <div className="flex gap-1.5">
            {[
                { label: "CSV",   type: "csv",   cls: "bg-gray-100"  },
                { label: "Excel", type: "excel", cls: "bg-green-100" },
                { label: "PDF",   type: "pdf",   cls: "bg-red-100"   },
                { label: "DOCX",  type: "docx",  cls: "bg-blue-100"  },
            ].map(({ label, type, cls }) => (
                <button key={type} onClick={() => onExport(type)} className={`px-2.5 py-1.5 ${cls} rounded-lg text-[11px] font-medium`}>{label}</button>
            ))}
        </div>
    );
});

// ─── Toggle Per Bulan / Per Tahun ─────────────────────────────────────────────

const TogglePeriode = memo(function TogglePeriode({ jenisPeriode, onPilihBulan, onPilihTahun }) {
    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-1 text-xs font-medium">
            <button onClick={onPilihBulan} className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${jenisPeriode === "bulan" ? "bg-white text-[#1B8A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <Calendar size={12} />
                Per Bulan
                <ChevronDown size={11} />
            </button>
            <button onClick={onPilihTahun} className={`px-3 py-1.5 rounded-md transition-colors ${jenisPeriode === "tahun" ? "bg-white text-[#1B8A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                Per Tahun
            </button>
        </div>
    );
});

// ─── Modal Pilih Periode Bulanan ─────────────────────────────────────────────

const ModalPilihPeriode = memo(function ModalPilihPeriode({ tahun, bulan, onApplyBulan, onApplyRentang, onClose }) {
    const [selBulan, setSelBulan] = useState(bulan);
    const [selTahun, setSelTahun] = useState(tahun);
    const [dari, setDari]         = useState("");
    const [sampai, setSampai]     = useState("");
    const tahunOptions = Array.from({ length: 6 }, (_, i) => tahun - 3 + i);

    const handleTerapkan = () => {
        if (dari && sampai) {
            onApplyRentang(dari, sampai);
        } else {
            onApplyBulan(selTahun, selBulan);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Calendar size={18} className="text-[#1B8A3A]" />
                    <h3 className="font-semibold text-gray-800">Pilih Periode Bulanan</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Bulan</label>
                        <div className="relative">
                            <select
                                value={selBulan}
                                onChange={(e) => setSelBulan(Number(e.target.value))}
                                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20"
                            >
                                {NAMA_BULAN.map((nama, i) => (
                                    <option key={nama} value={i + 1}>{nama}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Tahun</label>
                        <div className="relative">
                            <select
                                value={selTahun}
                                onChange={(e) => setSelTahun(Number(e.target.value))}
                                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20"
                            >
                                {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 mb-4" />

                <p className="text-xs text-gray-400 mb-3">Atau pilih rentang tanggal kustom (opsional)</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Dari tanggal</label>
                        <input
                            type="date"
                            value={dari}
                            onChange={(e) => setDari(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Sampai tanggal</label>
                        <input
                            type="date"
                            value={sampai}
                            onChange={(e) => setSampai(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition">
                        Batal
                    </button>
                    <button onClick={handleTerapkan} className="py-2.5 rounded-xl bg-[#1B8A3A] text-white text-sm font-medium hover:bg-[#166e2e] transition">
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PenjualanTbs() {
    const { ringkasanTbs, transaksi, filterAktif } = usePage().props;

    const fmt      = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const firstDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay  = (d) => { const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return fmt(last); };

    const today        = new Date();
    const thisYear     = today.getFullYear();
    const thisMonth    = today.getMonth() + 1;
    const defaultStart = firstDay(today);
    const defaultEnd   = lastDay(today);

    // ── State ─────────────────────────────────────────────────────────────────
    const [pageTransaksi, setPageTransaksi]   = useState(1);
    const [cari, setCari]                     = useState(filterAktif?.cari || "");
    const [startDate, setStartDate]           = useState(filterAktif?.start || defaultStart);
    const [endDate, setEndDate]               = useState(filterAktif?.end   || defaultEnd);
    const [jenisPeriode, setJenisPeriode]     = useState("bulan");
    const [showPopupBulan, setShowPopupBulan] = useState(false);

    const isFirstSearch = useRef(true);

    // ── Reset pagination tiap server ngirim data baru ────────────────────────
    useEffect(() => { setPageTransaksi(1); }, [transaksi]);

    // ── Pagination client-side ──────────────────────────────────────────────
    const totalPagesTransaksi = Math.ceil((transaksi || []).length / ROWS_PER_PAGE);
    const paginatedTransaksi  = useMemo(() => (transaksi || []).slice((pageTransaksi - 1) * ROWS_PER_PAGE, pageTransaksi * ROWS_PER_PAGE), [transaksi, pageTransaksi]);

    // ── Fetch ke server ──────────────────────────────────────────────────────
    const fetchTransaksi = (overrides = {}) => {
        router.get(route('pemilik.penjualan-tbs'), {
            start: overrides.start ?? startDate,
            end:   overrides.end   ?? endDate,
            cari:  overrides.cari  ?? cari,
        }, { preserveState: true, preserveScroll: true, replace: true, only: ['transaksi', 'ringkasanTbs', 'filterAktif'] });
    };

    const pilihPerTahun = () => {
        setJenisPeriode("tahun");
        const [s, e] = getYearRange(thisYear);
        setStartDate(s);
        setEndDate(e);
        fetchTransaksi({ start: s, end: e });
    };

    const terapkanBulan = (tahun, bulan) => {
        setJenisPeriode("bulan");
        const start = new Date(tahun, bulan - 1, 1);
        const end   = new Date(tahun, bulan, 0);
        const s = fmt(start);
        const e = fmt(end);
        setStartDate(s);
        setEndDate(e);
        setShowPopupBulan(false);
        fetchTransaksi({ start: s, end: e });
    };

    const terapkanRentang = (mulai, akhir) => {
        setJenisPeriode("bulan");
        setStartDate(mulai);
        setEndDate(akhir);
        setShowPopupBulan(false);
        fetchTransaksi({ start: mulai, end: akhir });
    };

    // ── DEBOUNCE: pencarian anggota/transaksi ─────────────────────────────────
    useEffect(() => {
        if (isFirstSearch.current) { isFirstSearch.current = false; return; }
        const timer = setTimeout(() => { fetchTransaksi({ cari }); }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cari]);

    // ── Export ─────────────────────────────────────────────────────────────────
    const doExport = (type) => {
        const data = transaksi || [];
        if (type === "csv" || type === "excel") {
            const ws = XLSX.utils.json_to_sheet(data.map(t => ({
                Tanggal: formatTanggalIndo(t.tanggal_timbang),
                Anggota: t.nama_anggota,
                "Berat (kg)": t.berat_bersih_kg,
                "Harga/kg": t.harga_per_kg,
                "Total Nilai": t.total_nilai,
            })));
            if (type === "csv") {
                saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)]), "penjualan-tbs.csv");
            } else {
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Penjualan TBS");
                XLSX.writeFile(wb, "penjualan-tbs.xlsx");
            }
        }
        if (type === "pdf") {
            const doc = new jsPDF();
            doc.text("Penjualan TBS", 14, 10);
            autoTable(doc, {
                head: [["Tanggal", "Anggota", "Berat (kg)", "Harga/kg", "Total Nilai"]],
                body: data.map((t) => [
                    formatTanggalIndo(t.tanggal_timbang),
                    t.nama_anggota,
                    t.berat_bersih_kg,
                    `Rp ${formatRp(t.harga_per_kg)}`,
                    `Rp ${formatRp(t.total_nilai)}`,
                ]),
            });
            doc.save("penjualan-tbs.pdf");
        }
        if (type === "docx") {
            (async () => {
                const table = new Table({
                    rows: [
                        new TableRow({ children: ["Tanggal", "Anggota", "Berat (kg)", "Harga/kg", "Total Nilai"].map((h) => new TableCell({ children: [new Paragraph(h)] })) }),
                        ...data.map((t) => new TableRow({
                            children: [
                                formatTanggalIndo(t.tanggal_timbang),
                                t.nama_anggota,
                                String(t.berat_bersih_kg),
                                `Rp ${formatRp(t.harga_per_kg)}`,
                                `Rp ${formatRp(t.total_nilai)}`,
                            ].map((v) => new TableCell({ children: [new Paragraph(v)] })),
                        })),
                    ],
                });
                const doc  = new Document({ sections: [{ children: [table] }] });
                const blob = await Packer.toBlob(doc);
                saveAs(blob, "penjualan-tbs.docx");
            })();
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <MainLayout>

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-2">
                <Link href={route('pemilik.dashboard')} className="text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl font-semibold text-gray-800">Detail Penjualan TBS</h1>
            </div>

            {/* FILTER PERIODE */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <TogglePeriode
                    jenisPeriode={jenisPeriode}
                    onPilihBulan={() => setShowPopupBulan(true)}
                    onPilihTahun={pilihPerTahun}
                />
                <span className="text-xs text-gray-400">{formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)}</span>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-lime-100 rounded-2xl p-4 border border-lime-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Total Nilai Penjualan</p>
                    <p className="text-xl font-bold text-lime-800">Rp {formatRp(ringkasanTbs?.totalNilai)}</p>
                </div>
                <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Total Berat</p>
                    <p className="text-xl font-bold text-gray-900">{formatRp(ringkasanTbs?.totalBeratKg)} kg</p>
                </div>
                <div className="bg-emerald-100 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Harga TBS Berlaku</p>
                    <p className="text-xl font-bold text-emerald-800">Rp {formatRp(ringkasanTbs?.hargaBerlaku)}<span className="text-xs font-normal text-gray-600"> /kg</span></p>
                </div>
                <div className="bg-blue-100 rounded-2xl p-4 border border-blue-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Jumlah Transaksi</p>
                    <p className="text-xl font-bold text-blue-800">{(transaksi || []).length}</p>
                </div>
            </div>

            {/* TABEL PENJUALAN TBS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">
                        Riwayat Penjualan ({(transaksi || []).length})
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama anggota..."
                                value={cari}
                                onChange={(e) => setCari(e.target.value)}
                                className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56"
                            />
                        </div>
                        <ExportButtons onExport={doExport} />
                    </div>
                </div>

                {(transaksi || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">
                        Belum ada data penjualan TBS
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <th className="py-3 px-4 text-left">Tanggal</th>
                                    <th className="py-3 px-4 text-left">Anggota</th>
                                    <th className="py-3 px-4 text-right">Berat (kg)</th>
                                    <th className="py-3 px-4 text-right">Harga/kg</th>
                                    <th className="py-3 px-4 text-right">Total Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedTransaksi.map((t) => (
                                    <tr key={t.id_penjualan} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{formatTanggalIndo(t.tanggal_timbang)}</td>
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{t.nama_anggota}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">{t.berat_bersih_kg}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">Rp {formatRp(t.harga_per_kg)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] font-medium text-gray-800">Rp {formatRp(t.total_nilai)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPagesTransaksi > 1 && (
                    <Pagination current={pageTransaksi} total={totalPagesTransaksi} onChange={setPageTransaksi} />
                )}
            </div>

            {showPopupBulan && (
                <ModalPilihPeriode
                    tahun={thisYear}
                    bulan={thisMonth}
                    onApplyBulan={terapkanBulan}
                    onApplyRentang={terapkanRentang}
                    onClose={() => setShowPopupBulan(false)}
                />
            )}

        </MainLayout>
    );
}
