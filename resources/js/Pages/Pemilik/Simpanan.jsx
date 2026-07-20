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
const labelJenis = { pokok: "Pokok", wajib: "Wajib", pengambilan: "Pengambilan" };

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
        <div className="flex items-center justify-end gap-1.5 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <button onClick={() => onChange(Math.max(1, current - 1))} className="w-8 h-8 hover:bg-gray-100 rounded-md dark:hover:bg-gray-800">‹</button>
            {pages.map((p) => (
                <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 rounded-md ${p === current ? "border border-emerald-500 text-emerald-600 bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400 dark:bg-emerald-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}>{p}</button>
            ))}
            <button onClick={() => onChange(Math.min(total, current + 1))} className="w-8 h-8 hover:bg-gray-100 rounded-md dark:hover:bg-gray-800">›</button>
        </div>
    );
});

// ─── Export Button Group ───────────────────────────────────────────────────────

const ExportButtons = memo(function ExportButtons({ onExport }) {
    return (
        <div className="flex gap-1.5">
            {[
                { label: "CSV",   type: "csv",   cls: "bg-gray-100 dark:bg-gray-800 dark:text-gray-200"  },
                { label: "Excel", type: "excel", cls: "bg-green-100 dark:bg-green-900/20 dark:text-green-400" },
                { label: "PDF",   type: "pdf",   cls: "bg-red-100 dark:bg-red-900/20 dark:text-red-400"   },
                { label: "DOCX",  type: "docx",  cls: "bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"  },
            ].map(({ label, type, cls }) => (
                <button key={type} onClick={() => onExport(type)} className={`px-2.5 py-1.5 ${cls} rounded-lg text-[11px] font-medium`}>{label}</button>
            ))}
        </div>
    );
});

// ─── Toggle Per Bulan / Per Tahun ─────────────────────────────────────────────

const TogglePeriode = memo(function TogglePeriode({ jenisPeriode, onPilihBulan, onPilihTahun }) {
    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-1 text-xs font-medium dark:bg-gray-800">
            <button onClick={onPilihBulan} className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${jenisPeriode === "bulan" ? "bg-white text-[#1B8A3A] shadow-sm dark:bg-gray-900" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}>
                <Calendar size={12} />
                Per Bulan
                <ChevronDown size={11} />
            </button>
            <button onClick={onPilihTahun} className={`px-3 py-1.5 rounded-md transition-colors ${jenisPeriode === "tahun" ? "bg-white text-[#1B8A3A] shadow-sm dark:bg-gray-900" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}>
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 dark:bg-gray-900">
                <div className="flex items-center gap-2 mb-5">
                    <Calendar size={18} className="text-[#1B8A3A]" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pilih Periode Bulanan</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block dark:text-gray-400">Bulan</label>
                        <div className="relative">
                            <select
                                value={selBulan}
                                onChange={(e) => setSelBulan(Number(e.target.value))}
                                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            >
                                {NAMA_BULAN.map((nama, i) => (
                                    <option key={nama} value={i + 1}>{nama}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none dark:text-gray-500" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block dark:text-gray-400">Tahun</label>
                        <div className="relative">
                            <select
                                value={selTahun}
                                onChange={(e) => setSelTahun(Number(e.target.value))}
                                className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            >
                                {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none dark:text-gray-500" />
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100 mb-4 dark:border-gray-800" />

                <p className="text-xs text-gray-400 mb-3 dark:text-gray-500">Atau pilih rentang tanggal kustom (opsional)</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block dark:text-gray-400">Dari tanggal</label>
                        <input
                            type="date"
                            value={dari}
                            onChange={(e) => setDari(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1.5 block dark:text-gray-400">Sampai tanggal</label>
                        <input
                            type="date"
                            value={sampai}
                            onChange={(e) => setSampai(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose} className="py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
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

export default function Simpanan() {
    const { totalSimpanan, breakdownJenis, perAnggota, filterAktif } = usePage().props;

    const fmt      = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const firstDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay  = (d) => { const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return fmt(last); };

    const today        = new Date();
    const thisYear     = today.getFullYear();
    const thisMonth    = today.getMonth() + 1;
    const defaultStart = firstDay(today);
    const defaultEnd   = lastDay(today);

    // ── State ─────────────────────────────────────────────────────────────────
    const [pageAnggota, setPageAnggota]       = useState(1);
    const [cariAnggota, setCariAnggota]       = useState(filterAktif?.cari_anggota || "");
    const [startDate, setStartDate]           = useState(filterAktif?.start || defaultStart);
    const [endDate, setEndDate]               = useState(filterAktif?.end   || defaultEnd);
    const [jenisPeriode, setJenisPeriode]     = useState("bulan");
    const [showPopupBulan, setShowPopupBulan] = useState(false);

    const isFirstAnggotaSearch = useRef(true);

    // ── Reset pagination tiap server ngirim data baru ────────────────────────
    useEffect(() => { setPageAnggota(1); }, [perAnggota]);

    // ── Ringkasan breakdown jenis ─────────────────────────────────────────────
    const ringkasanJenis = useMemo(() => {
        const map = { pokok: 0, wajib: 0, pengambilan: 0 };
        (breakdownJenis || []).forEach((b) => { map[b.jenis] = Number(b.total || 0); });
        return map;
    }, [breakdownJenis]);

    const danaMasuk  = ringkasanJenis.pokok + ringkasanJenis.wajib;
    const danaKeluar = ringkasanJenis.pengambilan;

    // ── Pagination client-side ──────────────────────────────────────────────
    const totalPagesAnggota = Math.ceil((perAnggota || []).length / ROWS_PER_PAGE);
    const paginatedAnggota  = useMemo(() => (perAnggota || []).slice((pageAnggota - 1) * ROWS_PER_PAGE, pageAnggota * ROWS_PER_PAGE), [perAnggota, pageAnggota]);

    // ── Fetch ke server ──────────────────────────────────────────────────────
    const fetchAnggota = (overrides = {}) => {
        router.get(route('pemilik.simpanan'), {
            start:        overrides.start        ?? startDate,
            end:          overrides.end          ?? endDate,
            cari_anggota: overrides.cari_anggota ?? cariAnggota,
        }, { preserveState: true, preserveScroll: true, replace: true, only: ['perAnggota', 'totalSimpanan', 'breakdownJenis', 'filterAktif'] });
    };

    const pilihPerTahun = () => {
        setJenisPeriode("tahun");
        const [s, e] = getYearRange(thisYear);
        setStartDate(s);
        setEndDate(e);
        fetchAnggota({ start: s, end: e });
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
        fetchAnggota({ start: s, end: e });
    };

    const terapkanRentang = (mulai, akhir) => {
        setJenisPeriode("bulan");
        setStartDate(mulai);
        setEndDate(akhir);
        setShowPopupBulan(false);
        fetchAnggota({ start: mulai, end: akhir });
    };

    // ── DEBOUNCE: pencarian anggota ───────────────────────────────────────────
    useEffect(() => {
        if (isFirstAnggotaSearch.current) { isFirstAnggotaSearch.current = false; return; }
        const timer = setTimeout(() => { fetchAnggota({ cari_anggota: cariAnggota }); }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cariAnggota]);

    // ── Export Per Anggota ────────────────────────────────────────────────────
    const doExportAnggota = (type) => {
        const data = perAnggota || [];
        if (type === "csv" || type === "excel") {
            const ws = XLSX.utils.json_to_sheet(data.map(a => ({ Nama: a.nama_lengkap, Pokok: a.pokok, Wajib: a.wajib, Pengambilan: a.pengambilan, Total: a.total })));
            if (type === "csv") {
                saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)]), "simpanan-per-anggota.csv");
            } else {
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Per Anggota");
                XLSX.writeFile(wb, "simpanan-per-anggota.xlsx");
            }
        }
        if (type === "pdf") {
            const doc = new jsPDF();
            doc.text("Simpanan per Anggota", 14, 10);
            autoTable(doc, {
                head: [["Nama", "Pokok", "Wajib", "Pengambilan", "Total"]],
                body: data.map((a) => [a.nama_lengkap, `Rp ${formatRp(a.pokok)}`, `Rp ${formatRp(a.wajib)}`, `Rp ${formatRp(a.pengambilan)}`, `Rp ${formatRp(a.total)}`]),
            });
            doc.save("simpanan-per-anggota.pdf");
        }
        if (type === "docx") {
            (async () => {
                const table = new Table({
                    rows: [
                        new TableRow({ children: ["Nama", "Pokok", "Wajib", "Pengambilan", "Total"].map((h) => new TableCell({ children: [new Paragraph(h)] })) }),
                        ...data.map((a) => new TableRow({ children: [a.nama_lengkap, `Rp ${formatRp(a.pokok)}`, `Rp ${formatRp(a.wajib)}`, `Rp ${formatRp(a.pengambilan)}`, `Rp ${formatRp(a.total)}`].map((t) => new TableCell({ children: [new Paragraph(String(t))] })) })),
                    ],
                });
                const doc  = new Document({ sections: [{ children: [table] }] });
                const blob = await Packer.toBlob(doc);
                saveAs(blob, "simpanan-per-anggota.docx");
            })();
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <MainLayout>

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-2">
                <Link href={route('pemilik.dashboard')} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Detail Dana Simpanan</h1>
            </div>

            {/* FILTER PERIODE */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <TogglePeriode
                    jenisPeriode={jenisPeriode}
                    onPilihBulan={() => setShowPopupBulan(true)}
                    onPilihTahun={pilihPerTahun}
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)}</span>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-[11px] text-gray-600 font-medium mb-1 dark:text-gray-300">Total Dana Simpanan</p>
                    <p className="text-xl font-bold text-gray-900 mb-2 dark:text-gray-100">Rp {formatRp(totalSimpanan)}</p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">Dana Masuk: <span className="font-medium text-gray-800 dark:text-gray-100">Rp {formatRp(danaMasuk)}</span></p>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">Dana Keluar: <span className="font-medium text-gray-800 dark:text-gray-100">Rp {formatRp(danaKeluar)}</span></p>
                </div>
                {["pokok", "wajib", "pengambilan"].map((j) => {
                    const warna = j === "pokok"
                        ? { bg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-800", bgDark: "dark:bg-emerald-900/15 dark:border-emerald-900/30", textDark: "dark:text-emerald-400" }
                        : j === "wajib"
                        ? { bg: "bg-amber-100", border: "border-amber-200", text: "text-amber-800", bgDark: "dark:bg-amber-900/15 dark:border-amber-900/30", textDark: "dark:text-amber-400" }
                        : { bg: "bg-red-100", border: "border-red-200", text: "text-red-800", bgDark: "dark:bg-red-900/15 dark:border-red-900/30", textDark: "dark:text-red-400" };
                    return (
                        <div key={j} className={`rounded-2xl p-4 border shadow-sm ${warna.bg} ${warna.border} ${warna.bgDark}`}>
                            <p className="text-[11px] text-gray-600 font-medium mb-1 dark:text-gray-300">Simpanan {labelJenis[j]}</p>
                            <p className={`text-xl font-bold mb-2 ${warna.text} ${warna.textDark}`}>Rp {formatRp(ringkasanJenis[j])}</p>
                            <p className="text-[11px] text-gray-600 dark:text-gray-300">{(breakdownJenis || []).find(b => b.jenis === j)?.jumlah_transaksi || 0} transaksi</p>
                        </div>
                    );
                })}
            </div>

            {/* TABEL SIMPANAN PER ANGGOTA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 p-6 dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">
                        Simpanan per Anggota ({(perAnggota || []).length})
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Cari nama anggota..."
                                value={cariAnggota}
                                onChange={(e) => setCariAnggota(e.target.value)}
                                className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                            />
                        </div>
                        <ExportButtons onExport={doExportAnggota} />
                    </div>
                </div>

                {(perAnggota || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm dark:text-gray-600">
                        Belum ada data anggota
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase dark:bg-gray-800 dark:text-gray-400">
                                    <th className="py-3 px-4 text-left">Nama Anggota</th>
                                    <th className="py-3 px-4 text-right">Pokok</th>
                                    <th className="py-3 px-4 text-right">Wajib</th>
                                    <th className="py-3 px-4 text-right">Pengambilan</th>
                                    <th className="py-3 px-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {paginatedAnggota.map((a) => (
                                    <tr key={a.id_anggota} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-4 text-[11px] text-gray-600 dark:text-gray-300">{a.nama_lengkap}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600 dark:text-gray-300">Rp {formatRp(a.pokok)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600 dark:text-gray-300">Rp {formatRp(a.wajib)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600 dark:text-gray-300">Rp {formatRp(a.pengambilan)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] font-medium text-gray-800 dark:text-gray-100">Rp {formatRp(a.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPagesAnggota > 1 && (
                    <Pagination current={pageAnggota} total={totalPagesAnggota} onChange={setPageAnggota} />
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
