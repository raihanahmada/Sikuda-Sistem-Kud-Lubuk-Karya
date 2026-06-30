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

const jenisFilterOptions = ["Semua", "masuk", "keluar"];
const ROWS_PER_PAGE = 10;
const DEBOUNCE_MS = 500;

const labelJenis = { masuk: "Masuk", keluar: "Keluar" };
const colorJenis = { masuk: "#1B8A3A", keluar: "#EF4444" };

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

function formatTanggalSingkat(tanggalStr) {
    if (!tanggalStr) return "";
    const d = new Date(tanggalStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
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

// ─── Export Button Group (reusable) ────────────────────────────────────────────

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

// ─── Toggle Per Bulan / Per Tahun (gaya sama seperti Dashboard) ──────────────

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

// ─── Popup pemilih bulan / rentang tanggal kustom ──────────────────────────

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
    const { ringkasanKas, totalSimpananPokok, totalSimpananWajib, perSumber, riwayat, filterAktif } = usePage().props;

    // ── Helper tanggal ────────────────────────────────────────────────────────
    const fmt      = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const firstDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay  = (d) => { const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return fmt(last); };

    const today        = new Date();
    const thisYear      = today.getFullYear();
    const thisMonth     = today.getMonth() + 1;
    const defaultStart = `${thisYear}-01-01`;
    const defaultEnd   = `${thisYear}-12-31`;

    // ── State ─────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("sumber"); // "sumber" | "riwayat"
    const [page, setPage]           = useState(1);
    const [pageSumber, setPageSumber] = useState(1);

    const [startDate, setStartDate] = useState(filterAktif?.start || defaultStart);
    const [endDate, setEndDate]     = useState(filterAktif?.end   || defaultEnd);
    const [jenis, setJenis]         = useState(filterAktif?.jenis || "Semua");

    // Periode aktif — default: tahun berjalan
    const [jenisPeriode, setJenisPeriode] = useState("tahun"); // "bulan" | "tahun"
    const [showPopupBulan, setShowPopupBulan] = useState(false);

    const [cariSumber, setCariSumber]   = useState(filterAktif?.cari_sumber || "");
    const [cariRiwayat, setCariRiwayat] = useState(filterAktif?.cari_riwayat || "");

    const [exportModal, setExportModal] = useState({ open: false, type: null });
    const [exportStart, setExportStart] = useState("");
    const [exportEnd, setExportEnd]     = useState("");

    // Refs buat skip debounce di render pertama (biar gak fetch ulang pas mount)
    const isFirstSumberSearch  = useRef(true);
    const isFirstRiwayatSearch = useRef(true);

    // ── Reset pagination tiap server ngirim data baru ────────────────────────
    useEffect(() => { setPage(1); }, [riwayat]);
    useEffect(() => { setPageSumber(1); }, [perSumber]);

    // ── Ringkasan saldo ────────────────────────────────────────────────────────
    const saldoAkhir     = Number(ringkasanKas?.saldoAkhir || 0);
    const totalMasuk     = Number(ringkasanKas?.totalMasuk || 0);
    const totalKeluar    = Number(ringkasanKas?.totalKeluar || 0);
    const totalTransaksi = Number(ringkasanKas?.totalTransaksi || 0);
    const simpananPokok  = Number(totalSimpananPokok || 0);
    const simpananWajib  = Number(totalSimpananWajib || 0);

    // ── Pagination client-side (data udah difilter server) ──────────────────
    const totalPages = Math.ceil((riwayat || []).length / ROWS_PER_PAGE);
    const paginated  = useMemo(() =>
        (riwayat || []).slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
        [riwayat, page]
    );

    const totalPagesSumber = Math.ceil((perSumber || []).length / ROWS_PER_PAGE);
    const paginatedSumber  = useMemo(() =>
        (perSumber || []).slice((pageSumber - 1) * ROWS_PER_PAGE, pageSumber * ROWS_PER_PAGE),
        [perSumber, pageSumber]
    );

    // ── Fetch SEMUA data sekaligus (riwayat + perSumber + ringkasanKas + simpanan), dipakai oleh selektor periode di atas SUMMARY CARDS ──
    const fetchSemua = (overrides = {}) => {
        router.get(route('pemilik.kas'), {
            start: overrides.start ?? startDate,
            end: overrides.end ?? endDate,
            jenis: overrides.jenis ?? jenis,
            cari_riwayat: overrides.cari_riwayat ?? cariRiwayat,
            cari_sumber: overrides.cari_sumber ?? cariSumber,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['riwayat', 'perSumber', 'ringkasanKas', 'totalSimpananPokok', 'totalSimpananWajib', 'filterAktif'],
        });
    };

    // ── Fetch ke server (partial reload, cuma data yang relevan) — dipakai search/filter jenis di tab Riwayat ──
    const fetchRiwayat = (overrides = {}) => {
        router.get(route('pemilik.kas'), {
            start: overrides.start ?? startDate,
            end: overrides.end ?? endDate,
            jenis: overrides.jenis ?? jenis,
            cari_riwayat: overrides.cari_riwayat ?? cariRiwayat,
            cari_sumber: cariSumber,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['riwayat', 'filterAktif'],
        });
    };

    const fetchSumber = (overrides = {}) => {
        router.get(route('pemilik.kas'), {
            start: startDate,
            end: endDate,
            jenis,
            cari_riwayat: cariRiwayat,
            cari_sumber: overrides.cari_sumber ?? cariSumber,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['perSumber', 'filterAktif'],
        });
    };

    // ── DEBOUNCE: pencarian sumber ────────────────────────────────────────────
    useEffect(() => {
        if (isFirstSumberSearch.current) { isFirstSumberSearch.current = false; return; }
        const timer = setTimeout(() => {
            fetchSumber({ cari_sumber: cariSumber });
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cariSumber]);

    // ── DEBOUNCE: pencarian riwayat ───────────────────────────────────────────
    useEffect(() => {
        if (isFirstRiwayatSearch.current) { isFirstRiwayatSearch.current = false; return; }
        const timer = setTimeout(() => {
            fetchRiwayat({ cari_riwayat: cariRiwayat });
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cariRiwayat]);

    // ── Shortcut tanggal (dipakai HANYA di modal export — tidak diubah) ──────
    const getShortcut = (label) => {
        const n = new Date();
        const shortcuts = {
            "Bulan Ini" : [firstDay(n), lastDay(n)],
            "3 Bulan"   : [fmt(new Date(n.getFullYear(), n.getMonth()-2, 1)), lastDay(n)],
            "6 Bulan"   : [fmt(new Date(n.getFullYear(), n.getMonth()-5, 1)), lastDay(n)],
            "Tahun Ini" : [`${n.getFullYear()}-01-01`, `${n.getFullYear()}-12-31`],
        };
        return shortcuts[label];
    };

    const applyJenis = (val) => {
        setJenis(val);
        fetchRiwayat({ jenis: val });
    };

    // ── Periode: Per Bulan (buka popup) / Per Tahun (langsung tahun ini) — SEKARANG ikut update SUMMARY CARDS juga ──
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

    // ── Export modal (Riwayat — pakai rentang tanggal) — TIDAK DIUBAH ───────
    const openExport = (type) => {
        setExportStart(startDate);
        setExportEnd(endDate);
        setExportModal({ open: true, type });
    };

    const filteredDataByExportRange = () => {
        return (riwayat || []).filter((t) => t.tanggal >= exportStart && t.tanggal <= exportEnd);
    };

    const handleExportConfirm = () => {
        const data = filteredDataByExportRange();
        const { type } = exportModal;
        if (type === "csv")   doExportRiwayatCSV(data);
        if (type === "excel") doExportRiwayatExcel(data);
        if (type === "pdf")   doExportRiwayatPDF(data);
        if (type === "docx")  doExportRiwayatDocx(data);
        setExportModal({ open: false, type: null });
    };

    // ── Export Riwayat ─────────────────────────────────────────────────────────
    const doExportRiwayatCSV = (data) => {
        const ws = XLSX.utils.json_to_sheet(data.map(d => ({
            Tanggal: d.tanggal, Jenis: labelJenis[d.jenis] || d.jenis, Sumber: d.sumber,
            Jumlah: d.jumlah, Keterangan: d.keterangan, Oleh: d.oleh,
        })));
        saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)]), "riwayat-kas.csv");
    };

    const doExportRiwayatExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data.map(d => ({
            Tanggal: d.tanggal, Jenis: labelJenis[d.jenis] || d.jenis, Sumber: d.sumber,
            Jumlah: d.jumlah, Keterangan: d.keterangan, Oleh: d.oleh,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
        XLSX.writeFile(wb, "riwayat-kas.xlsx");
    };

    const doExportRiwayatPDF = (data) => {
        const doc = new jsPDF();
        doc.text("Riwayat Transaksi Kas", 14, 10);
        autoTable(doc, {
            head: [["Tanggal", "Jenis", "Sumber", "Jumlah", "Keterangan", "Oleh"]],
            body: data.map((d) => [d.tanggal, labelJenis[d.jenis] || d.jenis, d.sumber, `Rp ${formatRp(d.jumlah)}`, d.keterangan, d.oleh]),
        });
        doc.save("riwayat-kas.pdf");
    };

    const doExportRiwayatDocx = async (data) => {
        const table = new Table({
            rows: [
                new TableRow({
                    children: ["Tanggal", "Jenis", "Sumber", "Jumlah", "Keterangan", "Oleh"].map(
                        (h) => new TableCell({ children: [new Paragraph(h)] })
                    ),
                }),
                ...data.map((d) =>
                    new TableRow({
                        children: [d.tanggal, labelJenis[d.jenis] || d.jenis, d.sumber, `Rp ${formatRp(d.jumlah)}`, d.keterangan, d.oleh].map(
                            (t) => new TableCell({ children: [new Paragraph(String(t))] })
                        ),
                    })
                ),
            ],
        });
        const doc  = new Document({ sections: [{ children: [table] }] });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "riwayat-kas.docx");
    };

    // ── Export Rincian Keuangan (langsung download, gak pakai modal) ────────
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

                {/* Selektor periode untuk SUMMARY CARDS di bawah ini */}
                <div className="flex items-center gap-3">
                    <TogglePeriode jenisPeriode={jenisPeriode} onPilihBulan={() => setShowPopupBulan(true)} onPilihTahun={pilihPerTahun} />
                    <span className="text-xs text-gray-400">{formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)}</span>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Saldo Kas Pusat</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(saldoAkhir)}</p>
                    <p className="text-[10px] text-gray-500">Kas Masuk: <span className="text-gray-600">Rp {formatRp(totalMasuk)}</span></p>
                    <p className="text-[10px] text-gray-500">Kas Keluar: <span className="text-gray-600">Rp {formatRp(totalKeluar)}</span></p>
                </div>
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Kas Masuk</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(totalMasuk)}</p>
                    <p className="text-[10px] text-gray-500">Total dana masuk</p>
                </div>
                <div className="bg-red-50/60 rounded-2xl p-4 border border-red-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Kas Keluar</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(totalKeluar)}</p>
                    <p className="text-[10px] text-gray-500">Total dana keluar</p>
                </div>
                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Jumlah Total Transaksi</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">{totalTransaksi}</p>
                    <p className="text-[10px] text-gray-500">Pada periode ini</p>
                </div>
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Total Dana Simpanan Pokok</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(simpananPokok)}</p>
                    <p className="text-[10px] text-gray-500">Pada periode ini</p>
                </div>
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Total Dana Simpanan Wajib</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(simpananWajib)}</p>
                    <p className="text-[10px] text-gray-500">Pada periode ini</p>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex gap-1 border-b border-gray-200 mt-6">
                {[
                    { key: "sumber",  label: `Rincian Keuangan (${(perSumber || []).length})` },
                    { key: "riwayat", label: `Riwayat Transaksi (${(riwayat || []).length})` },
                ].map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${activeTab === tab.key ? "border-[#1B8A3A] text-[#1B8A3A]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════ TAB: PER SUMBER ══════════════ */}
            {activeTab === "sumber" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 rounded-t-none p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">Rincian Keuangan</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Cari kategori..." value={cariSumber} onChange={(e) => setCariSumber(e.target.value)} className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56" />
                        </div>
                        <ExportButtons onExport={doExportSumber} />
                    </div>
                </div>

                {(perSumber || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">Belum ada data kas</div>
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
            )}

            {/* ══════════════ TAB: RIWAYAT TRANSAKSI ══════════════ */}
            {activeTab === "riwayat" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 rounded-t-none p-6">

                {/* Header + search + export */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">Riwayat Transaksi</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Cari keterangan..." value={cariRiwayat} onChange={(e) => setCariRiwayat(e.target.value)} className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56" />
                        </div>
                        <select value={jenis} onChange={(e) => applyJenis(e.target.value)} className="border border-emerald-500 rounded-lg px-3 py-1.5 text-xs">
                            {jenisFilterOptions.map((j) => (
                                <option key={j} value={j}>{j === "Semua" ? "Semua Jenis" : labelJenis[j]}</option>
                            ))}
                        </select>
                        <ExportButtons onExport={openExport} />
                    </div>
                </div>

                <p className="text-xs text-gray-400 mb-3">Menampilkan periode: {formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)} (atur di bagian atas halaman)</p>

                <h3 className="text-xs text-gray-400 mb-3">{(riwayat || []).length} transaksi ditemukan</h3>

                {(riwayat || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">Belum ada data transaksi</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <th className="py-3 px-4 text-left">Tanggal</th>
                                    <th className="py-3 px-4 text-left">Jenis</th>
                                    <th className="py-3 px-4 text-left">Sumber</th>
                                    <th className="py-3 px-4 text-right">Jumlah</th>
                                    <th className="py-3 px-4 text-left">Keterangan</th>
                                    <th className="py-3 px-4 text-left">Oleh</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginated.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{formatTanggalSingkat(row.tanggal)}</td>
                                        <td className="py-3 px-4 text-[11px]">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${colorJenis[row.jenis]}1A`, color: colorJenis[row.jenis] }}>{labelJenis[row.jenis] || row.jenis}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{row.sumber}</td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            <span className={row.jenis === "keluar" ? "text-red-500" : "text-emerald-600"}>{row.jenis === "keluar" ? "-" : "+"} Rp {formatRp(row.jumlah)}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{row.keterangan}</td>
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{row.oleh}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <Pagination current={page} total={totalPages} onChange={setPage} />
                )}
            </div>
            )}

            {/* Popup pemilih bulan / rentang tanggal (selektor periode di header) */}
            {showPopupBulan && (
                <PopupPilihBulan tahun={thisYear} bulan={thisMonth} onApplyBulan={terapkanBulan} onApplyRentang={terapkanRentang} onClose={() => setShowPopupBulan(false)} />
            )}

            {/* EXPORT MODAL — khusus Riwayat (pakai rentang tanggal) — TIDAK DIUBAH SAMA SEKALI */}
            {exportModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="font-semibold text-gray-800 mb-1">Export {exportModal.type?.toUpperCase()}</h3>
                        <p className="text-xs text-gray-400 mb-4">Pilih rentang tanggal yang ingin diekspor</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {["Bulan Ini", "3 Bulan", "6 Bulan", "Tahun Ini"].map((label) => (
                                <button key={label} onClick={() => { const [s, e] = getShortcut(label); setExportStart(s); setExportEnd(e); }} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition">
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mb-3">
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Dari</label>
                                <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                                <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mb-5">
                            <span className="font-medium text-emerald-600">{filteredDataByExportRange().length}</span> transaksi akan diekspor
                        </p>
                        <p className="text-[10px] text-amber-500 mb-5 -mt-3">
                            * Hanya transaksi yang sesuai filter tanggal & pencarian saat ini yang tersedia untuk diekspor
                        </p>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setExportModal({ open: false, type: null })} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                                Batal
                            </button>
                            <button onClick={handleExportConfirm} className="px-4 py-2 text-sm bg-[#1B8A3A] text-white rounded-lg hover:bg-[#156e2e]">
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </MainLayout>
    );
}
