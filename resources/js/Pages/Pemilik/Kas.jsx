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

function formatRp(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

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

// ─── Popup pemilih bulan ──────────────────────────────────────────────────────

function PopupPilihBulan({ tahun, bulan, onApplyBulan, onApplyRentang, onClose }) {
    const [localTahun, setLocalTahun] = useState(tahun);
    const [localBulan, setLocalBulan] = useState(bulan);
    const [localMulai, setLocalMulai] = useState("");
    const [localAkhir, setLocalAkhir] = useState("");

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
                    <button
                        onClick={() => {
                            if (localMulai && localAkhir) {
                                onApplyRentang(localMulai, localAkhir);
                            } else {
                                onApplyBulan(localTahun, localBulan);
                            }
                        }}
                        className="flex-1 text-sm font-semibold text-white bg-[#1B8A3A] hover:bg-[#157030] rounded-xl py-2.5 transition-colors">
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Kas() {
    const { ringkasanKas, totalSimpananPokok, totalSimpananWajib, perSumber, filterAktif } = usePage().props;

    // ── Helper tanggal ────────────────────────────────────────────────────────
    const fmt      = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const firstDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay  = (d) => { const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return fmt(last); };

    const today    = new Date();
    const thisYear  = today.getFullYear();
    const thisMonth = today.getMonth() + 1;

    // ── State ─────────────────────────────────────────────────────────────────
    const [pageSumber, setPageSumber] = useState(1);
    const [startDate, setStartDate]   = useState(filterAktif?.start || `${thisYear}-01-01`);
    const [endDate, setEndDate]       = useState(filterAktif?.end   || `${thisYear}-12-31`);
    const [jenisPeriode, setJenisPeriode] = useState("tahun");
    const [showPopupBulan, setShowPopupBulan] = useState(false);
    const [cariSumber, setCariSumber] = useState(filterAktif?.cari_sumber || "");

    const isFirstSumberSearch = useRef(true);

    useEffect(() => { setPageSumber(1); }, [perSumber]);

    // ── Ringkasan saldo ────────────────────────────────────────────────────────
    const saldoAkhir     = Number(ringkasanKas?.saldoAkhir || 0);
    const totalMasuk     = Number(ringkasanKas?.totalMasuk || 0);
    const totalKeluar    = Number(ringkasanKas?.totalKeluar || 0);
    const totalTransaksi = Number(ringkasanKas?.totalTransaksi || 0);
    const simpananPokok  = Number(totalSimpananPokok || 0);
    const simpananWajib  = Number(totalSimpananWajib || 0);

    // ── Pagination ──────────────────────────────────────────────────────────
    const totalPagesSumber = Math.ceil((perSumber || []).length / ROWS_PER_PAGE);
    const paginatedSumber  = useMemo(() =>
        (perSumber || []).slice((pageSumber - 1) * ROWS_PER_PAGE, pageSumber * ROWS_PER_PAGE),
        [perSumber, pageSumber]
    );

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchSemua = (overrides = {}) => {
        router.get(route('pemilik.kas'), {
            start: overrides.start ?? startDate,
            end: overrides.end ?? endDate,
            cari_sumber: overrides.cari_sumber ?? cariSumber,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['perSumber', 'ringkasanKas', 'totalSimpananPokok', 'totalSimpananWajib', 'filterAktif'],
        });
    };

    const fetchSumber = (overrides = {}) => {
        router.get(route('pemilik.kas'), {
            start: startDate,
            end: endDate,
            cari_sumber: overrides.cari_sumber ?? cariSumber,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['perSumber', 'filterAktif'],
        });
    };

    // ── DEBOUNCE pencarian ───────────────────────────────────────────────────
    useEffect(() => {
        if (isFirstSumberSearch.current) { isFirstSumberSearch.current = false; return; }
        const timer = setTimeout(() => { fetchSumber({ cari_sumber: cariSumber }); }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cariSumber]);

    // ── Periode ─────────────────────────────────────────────────────────────
    const pilihPerTahun = () => {
        setJenisPeriode("tahun");
        const s = `${thisYear}-01-01`;
        const e = `${thisYear}-12-31`;
        setStartDate(s);
        setEndDate(e);
        fetchSemua({ start: s, end: e });
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
        fetchSemua({ start: s, end: e });
    };

    const terapkanRentang = (mulai, akhir) => {
        setJenisPeriode("bulan");
        setStartDate(mulai);
        setEndDate(akhir);
        setShowPopupBulan(false);
        fetchSemua({ start: mulai, end: akhir });
    };

    // ── Export Rincian Keuangan ───────────────────────────────────────────────
    const doExportSumber = (type) => {
        const data = perSumber || [];
        if (type === "csv" || type === "excel") {
            const ws = XLSX.utils.json_to_sheet(data.map(s => ({
                Kategori: s.sumber, "Jumlah Transaksi": s.jumlah_transaksi,
                "Kas Masuk": s.kas_masuk, "Kas Keluar": s.kas_keluar, Net: s.net,
            })));
            if (type === "csv") {
                saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)]), "rincian-keuangan.csv");
            } else {
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Rincian Keuangan");
                XLSX.writeFile(wb, "rincian-keuangan.xlsx");
            }
        }
        if (type === "pdf") {
            const doc = new jsPDF();
            doc.text("Rincian Keuangan", 14, 10);
            autoTable(doc, {
                head: [["Kategori", "Jumlah Transaksi", "Kas Masuk", "Kas Keluar", "Net"]],
                body: data.map((s) => [s.sumber, s.jumlah_transaksi, `Rp ${formatRp(s.kas_masuk)}`, `Rp ${formatRp(s.kas_keluar)}`, `Rp ${formatRp(s.net)}`]),
            });
            doc.save("rincian-keuangan.pdf");
        }
        if (type === "docx") {
            (async () => {
                const table = new Table({
                    rows: [
                        new TableRow({
                            children: ["Kategori", "Jumlah Transaksi", "Kas Masuk", "Kas Keluar", "Net"].map(
                                (h) => new TableCell({ children: [new Paragraph(h)] })
                            ),
                        }),
                        ...data.map((s) =>
                            new TableRow({
                                children: [s.sumber, String(s.jumlah_transaksi), `Rp ${formatRp(s.kas_masuk)}`, `Rp ${formatRp(s.kas_keluar)}`, `Rp ${formatRp(s.net)}`].map(
                                    (t) => new TableCell({ children: [new Paragraph(String(t))] })
                                ),
                            })
                        ),
                    ],
                });
                const doc  = new Document({ sections: [{ children: [table] }] });
                const blob = await Packer.toBlob(doc);
                saveAs(blob, "rincian-keuangan.docx");
            })();
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <MainLayout>

            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-3">
                    <Link href={route('pemilik.dashboard')} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-800">Detail Keuangan Koperasi</h1>
                </div>

                <div className="flex items-center gap-3">
                    <TogglePeriode jenisPeriode={jenisPeriode} onPilihBulan={() => setShowPopupBulan(true)} onPilihTahun={pilihPerTahun} />
                    <span className="text-xs text-gray-400">{formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)}</span>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Saldo Kas Pusat</p>
                    <p className="text-xl font-bold text-gray-900 mb-2">Rp {formatRp(saldoAkhir)}</p>
                    <p className="text-[11px] text-gray-600">Kas Masuk: <span className="font-medium text-gray-800">Rp {formatRp(totalMasuk)}</span></p>
                    <p className="text-[11px] text-gray-600">Kas Keluar: <span className="font-medium text-gray-800">Rp {formatRp(totalKeluar)}</span></p>
                </div>
                <div className="bg-emerald-100 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Kas Masuk</p>
                    <p className="text-xl font-bold text-emerald-800 mb-2">Rp {formatRp(totalMasuk)}</p>
                    <p className="text-[11px] text-gray-600">Total dana masuk</p>
                </div>
                <div className="bg-red-100 rounded-2xl p-4 border border-red-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Kas Keluar</p>
                    <p className="text-xl font-bold text-red-800 mb-2">Rp {formatRp(totalKeluar)}</p>
                    <p className="text-[11px] text-gray-600">Total dana keluar</p>
                </div>
                <div className="bg-blue-100 rounded-2xl p-4 border border-blue-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Jumlah Total Transaksi</p>
                    <p className="text-xl font-bold text-blue-800 mb-2">{totalTransaksi}</p>
                    <p className="text-[11px] text-gray-600">Pada periode ini</p>
                </div>
                <div className="bg-emerald-100 rounded-2xl p-4 border border-emerald-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Total Dana Simpanan Pokok</p>
                    <p className="text-xl font-bold text-emerald-800 mb-2">Rp {formatRp(simpananPokok)}</p>
                    <p className="text-[11px] text-gray-600">Pada periode ini</p>
                </div>
                <div className="bg-amber-100 rounded-2xl p-4 border border-amber-200 shadow-sm">
                    <p className="text-[11px] text-gray-600 font-medium mb-1">Total Dana Simpanan Wajib</p>
                    <p className="text-xl font-bold text-amber-800 mb-2">Rp {formatRp(simpananWajib)}</p>
                    <p className="text-[11px] text-gray-600">Pada periode ini</p>
                </div>
            </div>

            {/* TABEL RINCIAN KEUANGAN */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">
                        Rincian Keuangan ({(perSumber || []).length})
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari kategori..."
                                value={cariSumber}
                                onChange={(e) => setCariSumber(e.target.value)}
                                className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56"
                            />
                        </div>
                        <ExportButtons onExport={doExportSumber} />
                    </div>
                </div>

                {(perSumber || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">
                        Belum ada data kas
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <th className="py-3 px-4 text-left">Kategori</th>
                                    <th className="py-3 px-4 text-right">Jumlah Transaksi</th>
                                    <th className="py-3 px-4 text-right">Kas Masuk</th>
                                    <th className="py-3 px-4 text-right">Kas Keluar</th>
                                    <th className="py-3 px-4 text-right">Net</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedSumber.map((s) => (
                                    <tr key={s.sumber_key} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{s.sumber}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">{s.jumlah_transaksi}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">Rp {formatRp(s.kas_masuk)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">Rp {formatRp(s.kas_keluar)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] font-medium text-gray-800">Rp {formatRp(s.net)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPagesSumber > 1 && (
                    <Pagination current={pageSumber} total={totalPagesSumber} onChange={setPageSumber} />
                )}
            </div>

            {/* Popup pemilih bulan */}
            {showPopupBulan && (
                <PopupPilihBulan
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
