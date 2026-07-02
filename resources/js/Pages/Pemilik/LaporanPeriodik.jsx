import { useState, useMemo, useEffect, memo } from "react";
import MainLayout from "@/Layouts/Pemilik/MainLayout";
import KeuanganLayout from "@/Layouts/AdminKeuangan/KeuanganLayout";
import { usePage, router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel } from "docx";
import { Calendar, ChevronDown, Download, Filter } from "lucide-react";

// ─── Static ───────────────────────────────────────────────────────────────────

const jenisLaporan = ["Semua", "Transaksi Kas", "Pembelian Barang", "Simpanan", "Penyaluran Dana"];
const ROWS_PER_PAGE = 10;

// Jumlah tahun ke belakang yang ditampilkan sebagai shortcut di modal export
const TAHUN_MUNDUR = 5;

const NAMA_BULAN = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

function formatTanggalSingkat(tanggalStr) {
    if (!tanggalStr) return "";
    const d = new Date(tanggalStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function fmt(d)      { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function firstDay(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`; }
function lastDay(d)  { const last = new Date(d.getFullYear(), d.getMonth()+1, 0); return fmt(last); }
function getYearRange(year) { return [`${year}-01-01`, `${year}-12-31`]; }

// Ringkasan total masuk/keluar + rincian per jenis — dipakai untuk preview & isi dokumen cetak (PDF/DOCX)
function hitungRingkasan(data) {
    const totalMasuk  = data.filter((d) => d.tipe === "masuk").reduce((s, d) => s + Number(d.jumlah || 0), 0);
    const totalKeluar = data.filter((d) => d.tipe === "keluar").reduce((s, d) => s + Number(d.jumlah || 0), 0);

    const perJenis = {};
    data.forEach((d) => {
        if (!perJenis[d.jenis]) perJenis[d.jenis] = { jenis: d.jenis, jumlahTransaksi: 0, totalMasuk: 0, totalKeluar: 0 };
        perJenis[d.jenis].jumlahTransaksi += 1;
        if (d.tipe === "masuk") perJenis[d.jenis].totalMasuk += Number(d.jumlah || 0);
        else perJenis[d.jenis].totalKeluar += Number(d.jumlah || 0);
    });

    return { totalMasuk, totalKeluar, labaBersih: totalMasuk - totalKeluar, breakdown: Object.values(perJenis) };
}

// ─── Pagination ───────────────────────────────────────────────────────────────

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

// ─── Toggle Per Bulan / Per Tahun (gaya sama seperti Kas/Simpanan) — khusus Control Panel ──

const TogglePeriode = memo(function TogglePeriode({ jenisPeriode, onPilihBulan, onPilihTahun }) {
    return (
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 text-sm font-medium">
            <button onClick={onPilihBulan} className={`flex items-center gap-1 px-4 py-1.5 rounded-md transition-colors ${jenisPeriode === "bulan" ? "bg-white text-[#1B8A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                <Calendar size={13} />
                Per Bulan
                <ChevronDown size={12} />
            </button>
            <button onClick={onPilihTahun} className={`px-5 py-1.5 rounded-md transition-colors ${jenisPeriode === "tahun" ? "bg-white text-[#1B8A3A] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                Per Tahun
            </button>
        </div>
    );
});

// ─── Shortcut Button (reusable, beda warna untuk tahun lalu) — khusus modal Export ────────

const ShortcutBtn = memo(function ShortcutBtn({ label, isYear, onClick }) {
    return (
        <button onClick={onClick} className={`px-3 py-1.5 text-xs border rounded-lg transition ${isYear ? "border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-500" : "border-gray-200 hover:border-emerald-500 hover:text-emerald-600"}`}>
            {label}
        </button>
    );
});

// ─── Popup pemilih bulan / rentang tanggal kustom (gaya sama persis seperti Kas/Simpanan) — Control Panel ──

function PopupPilihBulan({ tahunTersedia, tahun, bulan, onApplyBulan, onApplyRentang, onClose }) {
    const [localTahun, setLocalTahun] = useState(tahun);
    const [localBulan, setLocalBulan] = useState(bulan);
    const [localMulai, setLocalMulai] = useState("");
    const [localAkhir, setLocalAkhir] = useState("");

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
                            {(tahunTersedia || []).map((th) => (
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

export default function LaporanPeriodik() {
    const inertiaPage = usePage();
    const { transaksi, summary, filterAktif, tahunTersedia, auth } = inertiaPage.props;
    const inertiaVersion = inertiaPage.version;

    // ── Halaman ini diakses bersama oleh role pemilik & admin_keuangan — tampilkan shell/layout sesuai role login ──
    const isAdminKeuangan = auth?.user?.role === "admin_keuangan";
    const Layout = isAdminKeuangan ? KeuanganLayout : MainLayout;
    const layoutProps = isAdminKeuangan ? { title: "Laporan Periodik — Keuangan" } : {};

    const today = new Date();
    const thisYear = today.getFullYear();

    // Daftar tahun-tahun sebelumnya secara dinamis (dipakai DI MODAL EXPORT saja)
    const tahunSebelumnya = Array.from({ length: TAHUN_MUNDUR }, (_, i) => thisYear - 1 - i);

    // ── State mode periode (filter utama halaman) — default: tahun ini berjalan ──
    const [modePeriode, setModePeriode] = useState(filterAktif?.mode || "tahun");
    const [tahunDipilih, setTahunDipilih] = useState(filterAktif?.tahun || thisYear);
    const [bulanDipilih, setBulanDipilih] = useState(filterAktif?.bulan || today.getMonth() + 1);
    const [showPopupBulan, setShowPopupBulan] = useState(false);

    // ── State tabel ───────────────────────────────────────────────────────────
    const [jenis, setJenis] = useState("Semua");
    const [page, setPage] = useState(1);

    // ── State dropdown pilihan format export (tombol "Export" tunggal) ──────
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    // ── State dropdown filter jenis transaksi (tombol "Filter Jenis") ────────
    const [showFilterJenisDropdown, setShowFilterJenisDropdown] = useState(false);

    // ── State export modal — sekarang pakai rentang tanggal langsung (gaya sama seperti Kas/Simpanan) ──
    const [exportModal, setExportModal] = useState({ open: false, type: null });
    const [exportStart, setExportStart] = useState("");
    const [exportEnd, setExportEnd] = useState("");
    const [exportLoading, setExportLoading] = useState(false);
    const [exportPreviewCount, setExportPreviewCount] = useState(null);

    // ── State preview dokumen — khusus PDF & DOCX, tampil sebelum benar-benar dicetak/diunduh ──
    const [previewDoc, setPreviewDoc] = useState({ open: false, type: null, data: [], ringkasan: null, periodeLabel: "" });
    const [previewDownloading, setPreviewDownloading] = useState(false);

    // ── Kirim filter ke server ────────────────────────────────────────────────
    const applyFilter = (mode, tahun, bulan) => {
        setPage(1);
        const params = { mode, tahun };
        if (mode === "bulan") params.bulan = bulan;
        router.get(route("shared.laporan.periodik"), params, {
            preserveState: false,
            replace: true,
        });
    };

    const applyFilterRentang = (mulai, akhir) => {
        setPage(1);
        router.get(route("shared.laporan.periodik"), {
            mode: "rentang",
            tanggal_mulai: mulai,
            tanggal_akhir: akhir,
        }, {
            preserveState: false,
            replace: true,
        });
    };

    // ── Handler periode utama: Per Tahun (langsung tahun ini) / Per Bulan (popup) ──
    const pilihPerTahun = () => {
        setModePeriode("tahun");
        applyFilter("tahun", tahunDipilih, bulanDipilih);
    };

    const bukaPopupBulan = () => {
        setShowPopupBulan(true);
    };

    const terapkanBulan = (tahun, bulan) => {
        setModePeriode("bulan");
        setTahunDipilih(tahun);
        setBulanDipilih(bulan);
        setShowPopupBulan(false);
        applyFilter("bulan", tahun, bulan);
    };

    const terapkanRentang = (mulai, akhir) => {
        setModePeriode("bulan");
        setShowPopupBulan(false);
        applyFilterRentang(mulai, akhir);
    };

    // ── Filter jenis (client-side) ────────────────────────────────────────────
    const filteredData = useMemo(() => {
        if (jenis === "Semua") return transaksi || [];
        return (transaksi || []).filter((t) => t.jenis === jenis);
    }, [transaksi, jenis]);

    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    const paginated = useMemo(
        () => filteredData.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
        [filteredData, page],
    );

    // ── Shortcut tanggal (dipakai HANYA di modal export) ─────────────────────
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
        return shortcuts[label] ?? [exportStart, exportEnd];
    };

    // Klik tombol Export di tabel → tutup dropdown format, buka modal export dengan rentang default = filter yang sedang aktif
    const openExport = (type) => {
        setShowExportDropdown(false);
        setExportStart(filterAktif?.start || firstDay(today));
        setExportEnd(filterAktif?.end || lastDay(today));
        setExportPreviewCount(null);
        setExportModal({ open: true, type });
    };

    // ── Fetch JUMLAH transaksi langsung dari server sesuai rentang export (akurat, bukan filter ulang data lama) ──
    useEffect(() => {
        if (!exportModal.open) return;
        if (!exportStart || !exportEnd) return;

        setExportPreviewCount(null);
        const ctrl = new AbortController();
        const params = new URLSearchParams({ mode: "rentang", tanggal_mulai: exportStart, tanggal_akhir: exportEnd }).toString();

        fetch(`${route("shared.laporan.periodik")}?${params}`, {
            headers: { "X-Inertia": "true", "X-Inertia-Version": inertiaVersion, Accept: "application/json" },
            signal: ctrl.signal,
        })
            .then((r) => r.json())
            .then((data) => {
                const list = data?.props?.transaksi ?? [];
                const filtered = jenis === "Semua" ? list : list.filter((t) => t.jenis === jenis);
                setExportPreviewCount(filtered.length);
            })
            .catch(() => {});

        return () => ctrl.abort();
    }, [exportModal.open, exportStart, exportEnd, jenis]);

    // ── Ambil data ASLI dari server sesuai rentang export, baru di-download ──
    const handleExportConfirm = async () => {
        setExportLoading(true);
        try {
            const params = new URLSearchParams({ mode: "rentang", tanggal_mulai: exportStart, tanggal_akhir: exportEnd }).toString();
            const res = await fetch(`${route("shared.laporan.periodik")}?${params}`, {
                headers: { "X-Inertia": "true", "X-Inertia-Version": inertiaVersion, Accept: "application/json" },
            });
            if (!res.ok) throw new Error(`Gagal mengambil data (status ${res.status})`);
            const json = await res.json();
            const list = json?.props?.transaksi ?? [];
            const data = jenis === "Semua" ? list : list.filter((t) => t.jenis === jenis);

            const { type } = exportModal;
            if (type === "csv" || type === "excel") {
                if (type === "csv") doExportCSV(data);
                if (type === "excel") doExportExcel(data);
                setExportModal({ open: false, type: null });
            } else {
                // PDF & DOCX adalah dokumen "cetak" — tampilkan preview dulu, unduh sesungguhnya baru terjadi setelah user konfirmasi di preview
                setPreviewDoc({
                    open: true,
                    type,
                    data,
                    ringkasan: hitungRingkasan(data),
                    periodeLabel: `${formatTanggalSingkat(exportStart)} s.d. ${formatTanggalSingkat(exportEnd)}`,
                });
                setExportModal({ open: false, type: null });
            }
        } catch (e) {
            console.error("Export gagal:", e);
        } finally {
            setExportLoading(false);
        }
    };

    // ── Konfirmasi dari preview → baru generate & unduh file sesungguhnya ──
    const handlePreviewConfirm = async () => {
        setPreviewDownloading(true);
        try {
            const { type, data, ringkasan, periodeLabel } = previewDoc;
            if (type === "pdf") doExportPDF(data, ringkasan, periodeLabel);
            if (type === "docx") await doExportDocx(data, ringkasan, periodeLabel);
        } catch (e) {
            console.error("Export gagal:", e);
        } finally {
            setPreviewDownloading(false);
            setPreviewDoc({ open: false, type: null, data: [], ringkasan: null, periodeLabel: "" });
        }
    };

    // ── Fungsi export ─────────────────────────────────────────────────────────
    const doExportCSV = (data) => {
        const ws = XLSX.utils.json_to_sheet(data.map((d) => ({
            Tanggal: d.tanggal, Jenis: d.jenis, Deskripsi: d.deskripsi,
            Jumlah: d.jumlah, Unit: d.unit, Tipe: d.tipe,
        })));
        saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)]), "laporan.csv");
    };

    const doExportExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data.map((d) => ({
            Tanggal: d.tanggal, Jenis: d.jenis, Deskripsi: d.deskripsi,
            Jumlah: d.jumlah, Unit: d.unit, Tipe: d.tipe,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan");
        XLSX.writeFile(wb, "laporan.xlsx");
    };

    const doExportPDF = (data, ringkasan, periodeLabel) => {
        const doc = new jsPDF();

        doc.setFontSize(14);
        doc.text("Laporan Periodik Koperasi", 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(110);
        doc.text(`Periode: ${periodeLabel}`, 14, 21);
        doc.text(`Dicetak: ${formatTanggalSingkat(fmt(new Date()))}`, 14, 26);
        doc.setTextColor(0);

        // Ringkasan total masuk / keluar / laba bersih
        autoTable(doc, {
            startY: 32,
            theme: "plain",
            styles: { fontSize: 9, cellPadding: 1 },
            columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
            body: [
                ["Total Pemasukan", `Rp ${formatRp(ringkasan.totalMasuk)}`],
                ["Total Pengeluaran", `Rp ${formatRp(ringkasan.totalKeluar)}`],
                ["Laba / Rugi Bersih", `Rp ${formatRp(ringkasan.labaBersih)}`],
            ],
        });

        // Rincian per jenis laporan (mis. Transaksi Kas: total masuk & keluar)
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 6,
            head: [["Jenis", "Jml Transaksi", "Total Masuk", "Total Keluar"]],
            body: ringkasan.breakdown.map((b) => [
                b.jenis, String(b.jumlahTransaksi), `Rp ${formatRp(b.totalMasuk)}`, `Rp ${formatRp(b.totalKeluar)}`,
            ]),
            headStyles: { fillColor: [27, 138, 58] },
            styles: { fontSize: 9 },
        });

        // Detail transaksi
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 8,
            head: [["Tanggal", "Jenis", "Deskripsi", "Jumlah", "Unit", "Tipe"]],
            body: data.map((d) => [d.tanggal, d.jenis, d.deskripsi, `Rp ${formatRp(d.jumlah)}`, d.unit, d.tipe]),
            headStyles: { fillColor: [27, 138, 58] },
            styles: { fontSize: 8 },
        });

        doc.save("laporan-periodik.pdf");
    };

    const doExportDocx = async (data, ringkasan, periodeLabel) => {
        const baris = (label, value, bold = false) => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: value, bold })] })] }),
            ],
        });

        const ringkasanTable = new Table({
            rows: [
                baris("Total Pemasukan", `Rp ${formatRp(ringkasan.totalMasuk)}`),
                baris("Total Pengeluaran", `Rp ${formatRp(ringkasan.totalKeluar)}`),
                baris("Laba / Rugi Bersih", `Rp ${formatRp(ringkasan.labaBersih)}`, true),
            ],
        });

        const headerRow = (labels) => new TableRow({
            children: labels.map((h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })),
        });

        const breakdownTable = new Table({
            rows: [
                headerRow(["Jenis", "Jml Transaksi", "Total Masuk", "Total Keluar"]),
                ...ringkasan.breakdown.map((b) => new TableRow({
                    children: [b.jenis, String(b.jumlahTransaksi), `Rp ${formatRp(b.totalMasuk)}`, `Rp ${formatRp(b.totalKeluar)}`].map(
                        (t) => new TableCell({ children: [new Paragraph(String(t))] })
                    ),
                })),
            ],
        });

        const detailTable = new Table({
            rows: [
                headerRow(["Tanggal", "Jenis", "Deskripsi", "Jumlah", "Unit"]),
                ...data.map((d) => new TableRow({
                    children: [d.tanggal, d.jenis, d.deskripsi, `Rp ${formatRp(d.jumlah)}`, d.unit].map(
                        (t) => new TableCell({ children: [new Paragraph(String(t))] })
                    ),
                })),
            ],
        });

        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Laporan Periodik Koperasi", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ text: `Periode: ${periodeLabel}` }),
                    new Paragraph({ text: `Dicetak: ${formatTanggalSingkat(fmt(new Date()))}` }),
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "Ringkasan", heading: HeadingLevel.HEADING_2 }),
                    ringkasanTable,
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "Rincian per Jenis Laporan", heading: HeadingLevel.HEADING_2 }),
                    breakdownTable,
                    new Paragraph({ text: "" }),
                    new Paragraph({ text: "Detail Transaksi", heading: HeadingLevel.HEADING_2 }),
                    detailTable,
                ],
            }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "laporan-periodik.docx");
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Layout {...layoutProps}>
            {/* HEADER */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Laporan Periodik Koperasi</h1>
                    {filterAktif?.labelPeriode && (
                        <span className="inline-block mt-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-100 shadow-sm text-sm font-medium text-emerald-700">
                            Periode: {filterAktif.labelPeriode}
                        </span>
                    )}
                </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Report Control Panel</h2>

                <div className="flex flex-wrap items-center gap-4 mb-5">
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Jenis Periode</label>
                        <TogglePeriode jenisPeriode={modePeriode} onPilihBulan={bukaPopupBulan} onPilihTahun={pilihPerTahun} />
                    </div>
                    <span className="text-sm text-gray-400 mt-6">
                        {filterAktif?.labelPeriode
                            ? filterAktif.labelPeriode
                            : modePeriode === "tahun"
                              ? `Tahun ${tahunDipilih}`
                              : `${NAMA_BULAN[bulanDipilih - 1]} ${tahunDipilih}`}
                    </span>
                </div>

                <div className="max-w-sm">
                    <label className="block text-sm text-gray-500 mb-1.5">Jenis Laporan</label>
                    <select value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1); }} className="w-full border border-emerald-500 rounded-lg px-3 py-2 text-sm">
                        {jenisLaporan.map((j) => (
                            <option key={j}>{j}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                    { label: "Total Pemasukan", value: summary.totalMasuk, emoji: "💰", bg: "bg-emerald-100", color: "text-emerald-700" },
                    { label: "Total Pengeluaran", value: summary.totalKeluar, emoji: "💳", bg: "bg-red-100", color: "text-red-600" },
                    { label: "Laba Bersih", value: summary.labaBersih, emoji: "📈", bg: "bg-emerald-100", color: "text-emerald-700" },
                ].map(({ label, value, emoji, bg, color }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>{emoji}</div>
                            <div>
                                <p className="text-xs text-gray-500">{label}</p>
                                <p className={`text-lg font-bold ${color}`}>
                                    {Number(value || 0) < 0 ? (
                                        <span className="text-red-500">- Rp {formatRp(Math.abs(value))}</span>
                                    ) : (
                                        `Rp ${formatRp(value)}`
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">
                        Rincian Transaksi ({filteredData.length} transaksi)
                    </h2>

                    <div className="flex items-center gap-2">
                        {/* Tombol Filter Jenis Transaksi — klik membuka dropdown pilihan jenis */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilterJenisDropdown((v) => !v)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition ${
                                    jenis !== "Semua"
                                        ? "border-[#1B8A3A] text-[#1B8A3A] bg-emerald-50"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}>
                                <Filter size={14} />
                                {jenis === "Semua" ? "Filter Jenis" : jenis}
                                <ChevronDown size={12} />
                            </button>

                            {showFilterJenisDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterJenisDropdown(false)} />
                                    <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-2 w-56">
                                        {jenisLaporan.map((j) => (
                                            <button
                                                key={j}
                                                onClick={() => {
                                                    setJenis(j);
                                                    setPage(1);
                                                    setShowFilterJenisDropdown(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                                    jenis === j
                                                        ? "bg-emerald-50 text-[#1B8A3A] font-medium"
                                                        : "text-gray-600 hover:bg-gray-50"
                                                }`}>
                                                {j}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Tombol Export tunggal — klik membuka dropdown pilihan format */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportDropdown((v) => !v)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#1B8A3A] text-white rounded-lg text-sm font-medium hover:bg-[#156e2e] transition">
                                <Download size={14} />
                                Export
                            </button>

                            {showExportDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
                                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex gap-1.5">
                                        {[
                                            { label: "CSV", type: "csv", cls: "bg-gray-100" },
                                            { label: "Excel", type: "excel", cls: "bg-green-100" },
                                            { label: "PDF", type: "pdf", cls: "bg-red-100" },
                                            { label: "DOCX", type: "docx", cls: "bg-blue-100" },
                                        ].map(({ label, type, cls }) => (
                                            <button key={type} onClick={() => openExport(type)} className={`px-3 py-1.5 ${cls} rounded-lg text-xs font-medium hover:opacity-80 transition`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {filteredData.length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">
                        Belum ada data transaksi pada periode ini
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <th className="py-3 px-4 text-left">Tanggal</th>
                                    <th className="py-3 px-4 text-left">Jenis</th>
                                    <th className="py-3 px-4 text-left">Deskripsi</th>
                                    <th className="py-3 px-4 text-right">Jumlah</th>
                                    <th className="py-3 px-4 text-left">Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginated.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{formatTanggalSingkat(row.tanggal)}</td>
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{row.jenis}</td>
                                        <td className="py-3 px-4 text-[11px] text-gray-600">{row.deskripsi}</td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            <span className={row.tipe === "masuk" ? "text-emerald-600" : "text-red-500"}>
                                                {row.tipe === "masuk" ? "+" : "-"} Rp {formatRp(row.jumlah)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{row.unit}</td>
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

            {/* Popup pemilih bulan / rentang tanggal (Control Panel utama) */}
            {showPopupBulan && (
                <PopupPilihBulan
                    tahunTersedia={tahunTersedia}
                    tahun={tahunDipilih}
                    bulan={bulanDipilih}
                    onApplyBulan={terapkanBulan}
                    onApplyRentang={terapkanRentang}
                    onClose={() => setShowPopupBulan(false)}
                />
            )}

            {/* EXPORT MODAL — gaya sama persis seperti Kas & Simpanan (shortcut + tahun sebelumnya + input manual) */}
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
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                )}
                                {exportLoading
                                    ? "Memuat..."
                                    : (exportModal.type === "pdf" || exportModal.type === "docx")
                                        ? "Lihat Preview"
                                        : "Export"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW DOKUMEN — khusus PDF & DOCX, tampil sebelum file benar-benar dicetak/diunduh */}
            {previewDoc.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        {/* Header dokumen */}
                        <div className="p-6 pb-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-800">Preview Dokumen — {previewDoc.type?.toUpperCase()}</h3>
                                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500">{previewDoc.data.length} transaksi</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">Laporan Periodik Koperasi &middot; Periode: {previewDoc.periodeLabel}</p>
                        </div>

                        <div className="px-6 overflow-y-auto flex-1">
                            {/* Ringkasan */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {previewDoc.ringkasan && [
                                    { label: "Pemasukan", value: previewDoc.ringkasan.totalMasuk, color: "text-emerald-700 bg-emerald-50" },
                                    { label: "Pengeluaran", value: previewDoc.ringkasan.totalKeluar, color: "text-red-600 bg-red-50" },
                                    { label: "Laba Bersih", value: previewDoc.ringkasan.labaBersih, color: "text-emerald-700 bg-emerald-50" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className={`rounded-xl p-3 ${color}`}>
                                        <p className="text-[10px] opacity-70">{label}</p>
                                        <p className="text-sm font-bold">Rp {formatRp(Math.abs(value))}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Rincian per jenis */}
                            <p className="text-[10px] text-gray-400 uppercase font-medium mb-1.5 tracking-wide">Rincian per Jenis</p>
                            <div className="overflow-x-auto mb-4 border border-gray-100 rounded-lg">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase">
                                            <th className="py-2 px-3 text-left">Jenis</th>
                                            <th className="py-2 px-3 text-right">Jml</th>
                                            <th className="py-2 px-3 text-right">Total Masuk</th>
                                            <th className="py-2 px-3 text-right">Total Keluar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewDoc.ringkasan?.breakdown.map((b) => (
                                            <tr key={b.jenis}>
                                                <td className="py-2 px-3 text-gray-600">{b.jenis}</td>
                                                <td className="py-2 px-3 text-right text-gray-500">{b.jumlahTransaksi}</td>
                                                <td className="py-2 px-3 text-right text-emerald-600">Rp {formatRp(b.totalMasuk)}</td>
                                                <td className="py-2 px-3 text-right text-red-500">Rp {formatRp(b.totalKeluar)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Detail transaksi */}
                            <p className="text-[10px] text-gray-400 uppercase font-medium mb-1.5 tracking-wide">Detail Transaksi</p>
                            <div className="overflow-x-auto mb-4 border border-gray-100 rounded-lg">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase">
                                            <th className="py-2 px-3 text-left">Tanggal</th>
                                            <th className="py-2 px-3 text-left">Jenis</th>
                                            <th className="py-2 px-3 text-left">Deskripsi</th>
                                            <th className="py-2 px-3 text-right">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewDoc.data.map((row, i) => (
                                            <tr key={i}>
                                                <td className="py-2 px-3 text-gray-500">{formatTanggalSingkat(row.tanggal)}</td>
                                                <td className="py-2 px-3 text-gray-600">{row.jenis}</td>
                                                <td className="py-2 px-3 text-gray-600">{row.deskripsi}</td>
                                                <td className="py-2 px-3 text-right font-medium">
                                                    <span className={row.tipe === "masuk" ? "text-emerald-600" : "text-red-500"}>
                                                        {row.tipe === "masuk" ? "+" : "-"} Rp {formatRp(row.jumlah)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setPreviewDoc({ open: false, type: null, data: [], ringkasan: null, periodeLabel: "" })}
                                disabled={previewDownloading}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                Batal
                            </button>
                            <button
                                onClick={handlePreviewConfirm}
                                disabled={previewDownloading}
                                className="px-4 py-2 text-sm bg-[#1B8A3A] text-white rounded-lg hover:bg-[#156e2e] disabled:opacity-50 flex items-center gap-2">
                                {previewDownloading && (
                                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                )}
                                {previewDownloading ? "Mengunduh..." : `Unduh ${previewDoc.type?.toUpperCase()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
