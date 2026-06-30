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

const jenisFilterOptions = ["Semua", "pokok", "wajib", "pengambilan"];
const ROWS_PER_PAGE = 10;
const DEBOUNCE_MS = 500;

const labelJenis = { pokok: "Pokok", wajib: "Wajib", pengambilan: "Pengambilan" };
const colorJenis = { pokok: "#1B8A3A", wajib: "#F59E0B", pengambilan: "#EF4444" };

// Jumlah tahun ke belakang yang ditampilkan sebagai shortcut
const TAHUN_MUNDUR = 5;

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

// ─── Shortcut Button (reusable, beda warna untuk tahun lalu) ─────────────────

const ShortcutBtn = memo(function ShortcutBtn({ label, isYear, onClick }) {
    return (
        <button onClick={onClick} className={`px-3 py-1.5 text-xs border rounded-lg transition ${isYear ? "border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500" : "border-gray-200 hover:border-emerald-500 hover:text-emerald-600"}`}>
            {label}
        </button>
    );
});

// ─── Toggle Per Bulan / Per Tahun (gaya sama seperti Dashboard) — khusus filter Riwayat ──

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

// ─── Popup pemilih bulan / rentang tanggal kustom — khusus filter Riwayat ──────

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
                            {NAMA_BULAN.map((nama, idx) => <option key={nama} value={idx + 1}>{nama}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">Tahun</label>
                        <select value={localTahun} onChange={(e) => setLocalTahun(Number(e.target.value))} className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]">
                            {tahunOptions.map((th) => <option key={th} value={th}>{th}</option>)}
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
                    <button onClick={onClose} className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2.5 transition-colors">Batal</button>
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

export default function Simpanan() {
    const { totalSimpanan, breakdownJenis, perAnggota, riwayat, filterAktif } = usePage().props;

    // ── Helper tanggal ────────────────────────────────────────────────────────
    const fmt      = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const firstDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    const lastDay  = (d) => { const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return fmt(last); };

    const today        = new Date();
    const thisYear     = today.getFullYear();
    const thisMonth    = today.getMonth() + 1;
    const defaultStart = firstDay(today);
    const defaultEnd   = lastDay(today);

    // Daftar tahun-tahun sebelumnya secara dinamis (dipakai DI MODAL EXPORT saja)
    const tahunSebelumnya = Array.from({ length: TAHUN_MUNDUR }, (_, i) => thisYear - 1 - i);

    // ── State ─────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("anggota"); // "anggota" | "riwayat"
    const [page, setPage]           = useState(1);
    const [pageAnggota, setPageAnggota] = useState(1);

    const [startDate, setStartDate] = useState(filterAktif?.start || defaultStart);
    const [endDate, setEndDate]     = useState(filterAktif?.end   || defaultEnd);
    const [jenis, setJenis]         = useState(filterAktif?.jenis || "Semua");

    // Periode aktif buat filter Riwayat (gaya sama seperti Dashboard)
    const [jenisPeriode, setJenisPeriode] = useState("bulan"); // "bulan" | "tahun"
    const [showPopupBulan, setShowPopupBulan] = useState(false);

    const [cariAnggota, setCariAnggota] = useState(filterAktif?.cari_anggota || "");
    const [cariRiwayat, setCariRiwayat] = useState(filterAktif?.cari_riwayat || "");

    const [exportModal, setExportModal] = useState({ open: false, type: null });
    const [exportStart, setExportStart] = useState("");
    const [exportEnd, setExportEnd]     = useState("");
    const [exportLoading, setExportLoading] = useState(false);
    const [exportPreviewCount, setExportPreviewCount] = useState(null);

    // Refs buat skip debounce di render pertama (biar gak fetch ulang pas mount)
    const isFirstAnggotaSearch = useRef(true);
    const isFirstRiwayatSearch = useRef(true);

    // ── Reset pagination tiap server ngirim data baru ────────────────────────
    useEffect(() => { setPage(1); }, [riwayat]);
    useEffect(() => { setPageAnggota(1); }, [perAnggota]);

    // ── Ringkasan breakdown jenis ─────────────────────────────────────────────
    const ringkasanJenis = useMemo(() => {
        const map = { pokok: 0, wajib: 0, pengambilan: 0 };
        (breakdownJenis || []).forEach((b) => { map[b.jenis] = Number(b.total || 0); });
        return map;
    }, [breakdownJenis]);

    const danaMasuk  = ringkasanJenis.pokok + ringkasanJenis.wajib;
    const danaKeluar = ringkasanJenis.pengambilan;

    // ── Pagination client-side (data udah difilter server) ──────────────────
    const totalPages = Math.ceil((riwayat || []).length / ROWS_PER_PAGE);
    const paginated  = useMemo(() => (riwayat || []).slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE), [riwayat, page]);

    const totalPagesAnggota = Math.ceil((perAnggota || []).length / ROWS_PER_PAGE);
    const paginatedAnggota  = useMemo(() => (perAnggota || []).slice((pageAnggota - 1) * ROWS_PER_PAGE, pageAnggota * ROWS_PER_PAGE), [perAnggota, pageAnggota]);

    // ── Fetch ke server (partial reload, cuma data yang relevan) ────────────
    const fetchRiwayat = (overrides = {}) => {
        router.get(route('pemilik.simpanan'), {
            start: overrides.start ?? startDate,
            end: overrides.end ?? endDate,
            jenis: overrides.jenis ?? jenis,
            cari_riwayat: overrides.cari_riwayat ?? cariRiwayat,
            cari_anggota: cariAnggota,
        }, { preserveState: true, preserveScroll: true, replace: true, only: ['riwayat', 'filterAktif', 'totalSimpanan', 'breakdownJenis'] });
    };

    const fetchAnggota = (overrides = {}) => {
        router.get(route('pemilik.simpanan'), {
            start: startDate,
            end: endDate,
            jenis,
            cari_riwayat: cariRiwayat,
            cari_anggota: overrides.cari_anggota ?? cariAnggota,
        }, { preserveState: true, preserveScroll: true, replace: true, only: ['perAnggota', 'filterAktif'] });
    };

    // ── DEBOUNCE: pencarian anggota ───────────────────────────────────────────
    useEffect(() => {
        if (isFirstAnggotaSearch.current) { isFirstAnggotaSearch.current = false; return; }
        const timer = setTimeout(() => { fetchAnggota({ cari_anggota: cariAnggota }); }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cariAnggota]);

    // ── DEBOUNCE: pencarian riwayat ───────────────────────────────────────────
    useEffect(() => {
        if (isFirstRiwayatSearch.current) { isFirstRiwayatSearch.current = false; return; }
        const timer = setTimeout(() => { fetchRiwayat({ cari_riwayat: cariRiwayat }); }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [cariRiwayat]);

    // ── Shortcut tanggal (dipakai HANYA di modal export — tidak diubah) ──────
    const getShortcut = (label) => {
        const n = new Date();

        // Cek apakah label adalah angka tahun (misal "2023", "2022", dst)
        if (/^\d{4}$/.test(label)) return getYearRange(Number(label));

        const shortcuts = {
            "Bulan Ini" : [firstDay(n), lastDay(n)],
            "3 Bulan"   : [fmt(new Date(n.getFullYear(), n.getMonth()-2, 1)), lastDay(n)],
            "6 Bulan"   : [fmt(new Date(n.getFullYear(), n.getMonth()-5, 1)), lastDay(n)],
            "Tahun Ini" : [`${thisYear}-01-01`, `${thisYear}-12-31`],
            "Semua Data": ["2000-01-01", fmt(n)],
        };
        return shortcuts[label] ?? [startDate, endDate];
    };

    const applyJenis = (val) => { setJenis(val); fetchRiwayat({ jenis: val }); };

    // ── Periode filter Riwayat: Per Bulan (buka popup) / Per Tahun (langsung tahun ini) ──
    const pilihPerTahunRiwayat = () => {
        setJenisPeriode("tahun");
        const [s, e] = getYearRange(thisYear);
        setStartDate(s);
        setEndDate(e);
        fetchRiwayat({ start: s, end: e });
    };

    const terapkanBulanRiwayat = (tahun, bulan) => {
        setJenisPeriode("bulan");
        const start = new Date(tahun, bulan - 1, 1);
        const end   = new Date(tahun, bulan, 0);
        const s = fmt(start);
        const e = fmt(end);
        setStartDate(s);
        setEndDate(e);
        setShowPopupBulan(false);
        fetchRiwayat({ start: s, end: e });
    };

    const terapkanRentangRiwayat = (mulai, akhir) => {
        setJenisPeriode("bulan");
        setStartDate(mulai);
        setEndDate(akhir);
        setShowPopupBulan(false);
        fetchRiwayat({ start: mulai, end: akhir });
    };

    // ── Export modal (Riwayat — pakai rentang tanggal, TIDAK DIUBAH) ─────────
    const openExport = (type) => {
        setExportStart(startDate);
        setExportEnd(endDate);
        setExportPreviewCount(null);
        setExportModal({ open: true, type });
    };

    // Fetch preview count dari server tiap exportStart/exportEnd berubah
    useEffect(() => {
        if (!exportModal.open) return;
        if (!exportStart || !exportEnd) return;

        setExportPreviewCount(null); // reset sambil loading
        const ctrl = new AbortController();

        fetch(
            route('pemilik.simpanan') + `?start=${exportStart}&end=${exportEnd}&jenis=${jenis}&cari_riwayat=${encodeURIComponent(cariRiwayat)}&preview_count=1`,
            { headers: { 'X-Inertia': 'true', 'X-Inertia-Version': '', Accept: 'application/json' }, signal: ctrl.signal }
        )
        .then(r => r.json())
        .then(data => {
            // Inertia mengembalikan { props: { riwayat: [...] } }
            const count = data?.props?.riwayat?.length ?? null;
            setExportPreviewCount(count);
        })
        .catch(() => {}); // diabaikan kalau di-abort

        return () => ctrl.abort();
    }, [exportStart, exportEnd, exportModal.open]);

    // Fetch data aktual dari server lalu download
    const handleExportConfirm = async () => {
        setExportLoading(true);
        try {
            const res = await fetch(
                route('pemilik.simpanan') + `?start=${exportStart}&end=${exportEnd}&jenis=${jenis}&cari_riwayat=${encodeURIComponent(cariRiwayat)}`,
                { headers: { 'X-Inertia': 'true', 'X-Inertia-Version': '', Accept: 'application/json' } }
            );
            const json = await res.json();
            const data = json?.props?.riwayat ?? [];

            const { type } = exportModal;
            if (type === "csv")   doExportRiwayatCSV(data);
            if (type === "excel") doExportRiwayatExcel(data);
            if (type === "pdf")   doExportRiwayatPDF(data);
            if (type === "docx")  await doExportRiwayatDocx(data);
        } catch (e) {
            console.error("Export gagal:", e);
        } finally {
            setExportLoading(false);
            setExportModal({ open: false, type: null });
        }
    };

    // ── Export Riwayat ─────────────────────────────────────────────────────────
    const doExportRiwayatCSV = (data) => {
        const ws = XLSX.utils.json_to_sheet(data.map(d => ({ Tanggal: d.tanggal, Jenis: labelJenis[d.jenis] || d.jenis, Anggota: d.anggota, Jumlah: d.jumlah, Keterangan: d.keterangan })));
        saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)]), "riwayat-simpanan.csv");
    };

    const doExportRiwayatExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data.map(d => ({ Tanggal: d.tanggal, Jenis: labelJenis[d.jenis] || d.jenis, Anggota: d.anggota, Jumlah: d.jumlah, Keterangan: d.keterangan })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
        XLSX.writeFile(wb, "riwayat-simpanan.xlsx");
    };

    const doExportRiwayatPDF = (data) => {
        const doc = new jsPDF();
        doc.text("Riwayat Transaksi Simpanan", 14, 10);
        autoTable(doc, {
            head: [["Tanggal", "Jenis", "Anggota", "Jumlah", "Keterangan"]],
            body: data.map((d) => [d.tanggal, labelJenis[d.jenis] || d.jenis, d.anggota, `Rp ${formatRp(d.jumlah)}`, d.keterangan]),
        });
        doc.save("riwayat-simpanan.pdf");
    };

    const doExportRiwayatDocx = async (data) => {
        const table = new Table({
            rows: [
                new TableRow({ children: ["Tanggal", "Jenis", "Anggota", "Jumlah", "Keterangan"].map((h) => new TableCell({ children: [new Paragraph(h)] })) }),
                ...data.map((d) => new TableRow({ children: [d.tanggal, labelJenis[d.jenis] || d.jenis, d.anggota, `Rp ${formatRp(d.jumlah)}`, d.keterangan].map((t) => new TableCell({ children: [new Paragraph(String(t))] })) })),
            ],
        });
        const doc  = new Document({ sections: [{ children: [table] }] });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "riwayat-simpanan.docx");
    };

    // ── Export Per Anggota (langsung download, gak pakai modal) ─────────────
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
                <Link href={route('pemilik.dashboard')} className="text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="text-xl font-semibold text-gray-800">Detail Dana Simpanan</h1>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50/60 rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[11px] text-gray-500 mb-1">Total Dana Simpanan</p>
                    <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(totalSimpanan)}</p>
                    <p className="text-[10px] text-gray-500">Dana Masuk: <span className="text-gray-600">Rp {formatRp(danaMasuk)}</span></p>
                    <p className="text-[10px] text-gray-500">Dana Keluar: <span className="text-gray-600">Rp {formatRp(danaKeluar)}</span></p>
                </div>
                {["pokok", "wajib", "pengambilan"].map((j) => (
                    <div key={j} className={`rounded-2xl p-4 border shadow-sm ${j === "pokok" ? "bg-emerald-50/60 border-emerald-100" : j === "wajib" ? "bg-amber-50/60 border-amber-100" : "bg-red-50/60 border-red-100"}`}>
                        <p className="text-[11px] text-gray-500 mb-1">Simpanan {labelJenis[j]}</p>
                        <p className="text-xl font-semibold text-gray-800 mb-2">Rp {formatRp(ringkasanJenis[j])}</p>
                        <p className="text-[10px] text-gray-500">{(breakdownJenis || []).find(b => b.jenis === j)?.jumlah_transaksi || 0} transaksi</p>
                    </div>
                ))}
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex gap-1 border-b border-gray-200 mt-6">
                {[
                    { key: "anggota", label: `Simpanan per Anggota (${(perAnggota || []).length})` },
                    { key: "riwayat", label: `Riwayat Transaksi (${(riwayat || []).length})` },
                ].map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${activeTab === tab.key ? "border-[#1B8A3A] text-[#1B8A3A]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ══════════════ TAB: PER ANGGOTA ══════════════ */}
            {activeTab === "anggota" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 rounded-t-none p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">Simpanan per Anggota</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Cari nama anggota..." value={cariAnggota} onChange={(e) => setCariAnggota(e.target.value)} className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56" />
                        </div>
                        <ExportButtons onExport={doExportAnggota} />
                    </div>
                </div>

                {(perAnggota || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">Belum ada data anggota</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <th className="py-3 px-4 text-left">Nama Anggota</th>
                                    <th className="py-3 px-4 text-right">Pokok</th>
                                    <th className="py-3 px-4 text-right">Wajib</th>
                                    <th className="py-3 px-4 text-right">Pengambilan</th>
                                    <th className="py-3 px-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedAnggota.map((a) => (
                                    <tr key={a.id_anggota} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{a.nama_lengkap}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">Rp {formatRp(a.pokok)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">Rp {formatRp(a.wajib)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] text-gray-600">Rp {formatRp(a.pengambilan)}</td>
                                        <td className="py-3 px-4 text-right text-[11px] font-medium text-gray-800">Rp {formatRp(a.total)}</td>
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
                            <input type="text" placeholder="Cari nama / keterangan..." value={cariRiwayat} onChange={(e) => setCariRiwayat(e.target.value)} className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56" />
                        </div>
                        <select value={jenis} onChange={(e) => applyJenis(e.target.value)} className="border border-emerald-500 rounded-lg pl-3 pr-8 py-2 text-sm">
                            {jenisFilterOptions.map((j) => (
                                <option key={j} value={j}>{j === "Semua" ? "Semua Jenis" : labelJenis[j]}</option>
                            ))}
                        </select>
                        <ExportButtons onExport={openExport} />
                    </div>
                </div>

                {/* Periode filter: Per Bulan / Per Tahun (gaya sama seperti Dashboard, disederhanakan) */}
                <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                    <TogglePeriode jenisPeriode={jenisPeriode} onPilihBulan={() => setShowPopupBulan(true)} onPilihTahun={pilihPerTahunRiwayat} />
                    <span className="text-xs text-gray-400">{formatTanggalIndo(startDate)} s/d {formatTanggalIndo(endDate)}</span>
                </div>

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
                                    <th className="py-3 px-4 text-left">Anggota</th>
                                    <th className="py-3 px-4 text-right">Jumlah</th>
                                    <th className="py-3 px-4 text-left">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginated.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{formatTanggalSingkat(row.tanggal)}</td>
                                        <td className="py-3 px-4 text-[11px]">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${colorJenis[row.jenis]}1A`, color: colorJenis[row.jenis] }}>{labelJenis[row.jenis] || row.jenis}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{row.anggota}</td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            <span className={row.jenis === "pengambilan" ? "text-red-500" : "text-emerald-600"}>{row.jenis === "pengambilan" ? "-" : "+"} Rp {formatRp(row.jumlah)}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{row.keterangan}</td>
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

            {/* Popup pemilih bulan / rentang tanggal (filter Riwayat) */}
            {showPopupBulan && (
                <PopupPilihBulan tahun={thisYear} bulan={thisMonth} onApplyBulan={terapkanBulanRiwayat} onApplyRentang={terapkanRentangRiwayat} onClose={() => setShowPopupBulan(false)} />
            )}

            {/* EXPORT MODAL — khusus Riwayat (pakai rentang tanggal) — TIDAK DIUBAH SAMA SEKALI */}
            {exportModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="font-semibold text-gray-800 mb-1">Export {exportModal.type?.toUpperCase()}</h3>
                        <p className="text-xs text-gray-400 mb-4">Pilih rentang tanggal yang ingin diekspor</p>

                        {/* Shortcut umum */}
                        <p className="text-[10px] text-gray-400 uppercase font-medium mb-1.5 tracking-wide">Periode</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {["Bulan Ini", "3 Bulan", "6 Bulan", "Tahun Ini", "Semua Data"].map((label) => (
                                <ShortcutBtn key={label} label={label} isYear={false} onClick={() => { const [s, e] = getShortcut(label); setExportStart(s); setExportEnd(e); }} />
                            ))}
                        </div>

                        {/* Shortcut tahun sebelumnya */}
                        <p className="text-[10px] text-gray-400 uppercase font-medium mb-1.5 tracking-wide">Tahun Sebelumnya</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {tahunSebelumnya.map((year) => (
                                <ShortcutBtn key={year} label={String(year)} isYear={true} onClick={() => { const [s, e] = getShortcut(String(year)); setExportStart(s); setExportEnd(e); }} />
                            ))}
                        </div>

                        {/* Input manual */}
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
                            {exportPreviewCount === null
                                ? <span className="text-gray-400 italic">Menghitung...</span>
                                : <><span className="font-medium text-emerald-600">{exportPreviewCount}</span> transaksi akan diekspor</>
                            }
                        </p>
                        <p className="text-[10px] text-amber-500 mb-5 -mt-3">
                            * Data diambil langsung dari server sesuai rentang tanggal &amp; filter jenis yang dipilih
                        </p>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setExportModal({ open: false, type: null })} disabled={exportLoading} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                Batal
                            </button>
                            <button onClick={handleExportConfirm} disabled={exportLoading || exportPreviewCount === 0} className="px-4 py-2 text-sm bg-[#1B8A3A] text-white rounded-lg hover:bg-[#156e2e] disabled:opacity-50 flex items-center gap-2">
                                {exportLoading && (
                                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                )}
                                {exportLoading ? "Mengunduh..." : "Export"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </MainLayout>
    );
}
