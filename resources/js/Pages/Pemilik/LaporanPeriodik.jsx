import { useState, useMemo, memo } from "react";
import MainLayout from "../../layouts/Pemilik/MainLayout";
import { usePage, router } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";

// ─── Static ───────────────────────────────────────────────────────────────────

const jenisLaporan = ["Semua", "Transaksi Kas", "Pembelian Barang", "Simpanan", "Penyaluran Dana"];
const ROWS_PER_PAGE = 10;

const NAMA_BULAN = [
    { label: "Januari",   value: 1  },
    { label: "Februari",  value: 2  },
    { label: "Maret",     value: 3  },
    { label: "April",     value: 4  },
    { label: "Mei",       value: 5  },
    { label: "Juni",      value: 6  },
    { label: "Juli",      value: 7  },
    { label: "Agustus",   value: 8  },
    { label: "September", value: 9  },
    { label: "Oktober",   value: 10 },
    { label: "November",  value: 11 },
    { label: "Desember",  value: 12 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRp(value) {
    return Number(value || 0).toLocaleString("id-ID");
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = memo(function Pagination({ current, total, onChange }) {
    const pages = Array.from({ length: total }, (_, i) => i + 1);
    return (
        <div className="flex items-center justify-end gap-1.5 mt-4 text-sm text-gray-500">
            <button onClick={() => onChange(Math.max(1, current - 1))} className="w-8 h-8 hover:bg-gray-100 rounded-md">‹</button>
            {pages.map((p) => (
                <button key={p} onClick={() => onChange(p)}
                    className={`w-8 h-8 rounded-md ${p === current ? "border border-emerald-500 text-emerald-600 bg-emerald-50" : "hover:bg-gray-100"}`}>
                    {p}
                </button>
            ))}
            <button onClick={() => onChange(Math.min(total, current + 1))} className="w-8 h-8 hover:bg-gray-100 rounded-md">›</button>
        </div>
    );
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LaporanPeriodik() {
    const { transaksi, summary, filterAktif, tahunTersedia } = usePage().props;

    const today = new Date();

    // ── State mode periode ────────────────────────────────────────────────────
    const [modePeriode, setModePeriode] = useState(filterAktif?.mode  || "tahun");
    const [tahunDipilih, setTahunDipilih] = useState(filterAktif?.tahun || today.getFullYear());
    const [bulanDipilih, setBulanDipilih] = useState(filterAktif?.bulan || (today.getMonth() + 1));

    // ── State tabel ───────────────────────────────────────────────────────────
    const [jenis, setJenis] = useState("Semua");
    const [page, setPage]   = useState(1);

    // ── State export modal ────────────────────────────────────────────────────
    const [exportModal, setExportModal] = useState({ open: false, type: null });
    const [exportMode, setExportMode]   = useState("tahun");
    const [exportTahun, setExportTahun] = useState(filterAktif?.tahun || today.getFullYear());
    const [exportBulan, setExportBulan] = useState(filterAktif?.bulan || (today.getMonth() + 1));

    // ── Kirim filter ke server ────────────────────────────────────────────────
    const applyFilter = (mode, tahun, bulan) => {
        setPage(1);
        const params = { mode, tahun };
        if (mode === "bulan") params.bulan = bulan;
        router.get(route("pemilik.laporan.periodik"), params, {
            preserveState: false,
            replace: true,
        });
    };

    // ── Handler ganti mode ────────────────────────────────────────────────────
    const handleModeChange = (mode) => {
        setModePeriode(mode);
        applyFilter(mode, tahunDipilih, bulanDipilih);
    };

    const handleTahunChange = (tahun) => {
        setTahunDipilih(tahun);
        applyFilter(modePeriode, tahun, bulanDipilih);
    };

    const handleBulanChange = (bulan) => {
        setBulanDipilih(bulan);
        applyFilter("bulan", tahunDipilih, bulan);
    };

    // ── Filter jenis (client-side) ────────────────────────────────────────────
    const filteredData = useMemo(() => {
        if (jenis === "Semua") return transaksi || [];
        return (transaksi || []).filter((t) => t.jenis === jenis);
    }, [transaksi, jenis]);

    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    const paginated  = useMemo(() =>
        filteredData.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
        [filteredData, page]
    );

    // ── Export helpers ────────────────────────────────────────────────────────
    const getExportRange = () => {
        if (exportMode === "tahun") {
            return { start: `${exportTahun}-01-01`, end: `${exportTahun}-12-31` };
        }
        const lastDay = new Date(exportTahun, exportBulan, 0).getDate();
        const m = String(exportBulan).padStart(2, "0");
        return { start: `${exportTahun}-${m}-01`, end: `${exportTahun}-${m}-${lastDay}` };
    };

    const filteredDataByExportRange = () => {
        const { start, end } = getExportRange();
        return (transaksi || [])
            .filter((t) => t.tanggal >= start && t.tanggal <= end)
            .filter((t) => jenis === "Semua" || t.jenis === jenis);
    };

    const openExport = (type) => {
        setExportMode(modePeriode);
        setExportTahun(tahunDipilih);
        setExportBulan(bulanDipilih);
        setExportModal({ open: true, type });
    };

    const handleExportConfirm = () => {
        const data = filteredDataByExportRange();
        const { type } = exportModal;
        if (type === "csv")   doExportCSV(data);
        if (type === "excel") doExportExcel(data);
        if (type === "pdf")   doExportPDF(data);
        if (type === "docx")  doExportDocx(data);
        setExportModal({ open: false, type: null });
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

    const doExportPDF = (data) => {
        const doc = new jsPDF();
        doc.text(`Laporan Periodik Koperasi — ${filterAktif?.labelPeriode || ""}`, 14, 10);
        autoTable(doc, {
            head: [["Tanggal", "Jenis", "Deskripsi", "Jumlah", "Unit", "Tipe"]],
            body: data.map((d) => [d.tanggal, d.jenis, d.deskripsi, `Rp ${formatRp(d.jumlah)}`, d.unit, d.tipe]),
        });
        doc.save("laporan.pdf");
    };

    const doExportDocx = async (data) => {
        const table = new Table({
            rows: [
                new TableRow({
                    children: ["Tanggal", "Jenis", "Deskripsi", "Jumlah", "Unit"].map(
                        (h) => new TableCell({ children: [new Paragraph(h)] })
                    ),
                }),
                ...data.map((d) =>
                    new TableRow({
                        children: [d.tanggal, d.jenis, d.deskripsi, `Rp ${formatRp(d.jumlah)}`, d.unit].map(
                            (t) => new TableCell({ children: [new Paragraph(String(t))] })
                        ),
                    })
                ),
            ],
        });
        const doc  = new Document({ sections: [{ children: [table] }] });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "laporan.docx");
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <MainLayout>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Laporan Periodik Koperasi</h1>
                    {filterAktif?.labelPeriode && (
                        <p className="text-sm text-emerald-600 font-medium mt-0.5">
                            Periode: {filterAktif.labelPeriode}
                        </p>
                    )}
                </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-800 mb-4">Report Control Panel</h2>

                {/* Toggle Mode Periode */}
                <div className="mb-5">
                    <label className="block text-sm text-gray-500 mb-2">Jenis Periode</label>
                    <div className="inline-flex gap-1 bg-gray-100 rounded-lg p-1">
                        {[
                            { key: "tahun", label: "Per Tahun" },
                            { key: "bulan", label: "Per Bulan" },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleModeChange(key)}
                                className={`px-5 py-1.5 text-sm rounded-md font-medium transition ${
                                    modePeriode === key
                                        ? "bg-white text-emerald-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ── Pilihan TAHUN (selalu tampil) ── */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-1.5">Tahun</label>
                        <div className="flex flex-wrap gap-2">
                            {(tahunTersedia || []).map((y) => (
                                <button
                                    key={y}
                                    onClick={() => handleTahunChange(y)}
                                    className={`px-4 py-1.5 text-sm border rounded-lg font-medium transition ${
                                        tahunDipilih === y
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
                                    }`}>
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Pilihan BULAN (hanya muncul jika mode = bulan) ── */}
                    {modePeriode === "bulan" && (
                        <div>
                            <label className="block text-sm text-gray-500 mb-1.5">Bulan</label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {NAMA_BULAN.map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => handleBulanChange(value)}
                                        className={`py-1.5 text-xs border rounded-lg transition ${
                                            bulanDipilih === value
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                                                : "border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
                                        }`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Filter Jenis Laporan ── */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-1.5">Jenis Laporan</label>
                        <select
                            value={jenis}
                            onChange={(e) => { setJenis(e.target.value); setPage(1); }}
                            className="w-full border border-emerald-500 rounded-lg px-3 py-2 text-sm">
                            {jenisLaporan.map((j) => <option key={j}>{j}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* EXPORT BUTTONS */}
            <div className="flex gap-2 mt-4">
                {[
                    { label: "CSV",   type: "csv",   cls: "bg-gray-100"  },
                    { label: "Excel", type: "excel", cls: "bg-green-100" },
                    { label: "PDF",   type: "pdf",   cls: "bg-red-100"   },
                    { label: "DOCX",  type: "docx",  cls: "bg-blue-100"  },
                ].map(({ label, type, cls }) => (
                    <button key={type} onClick={() => openExport(type)}
                        className={`px-3 py-2 ${cls} rounded-lg text-sm`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                    { label: "Total Pemasukan",   value: summary.totalMasuk,  emoji: "💰", bg: "bg-emerald-100", color: "text-emerald-700" },
                    { label: "Total Pengeluaran", value: summary.totalKeluar, emoji: "💳", bg: "bg-red-100",     color: "text-red-600"     },
                    { label: "Laba Bersih",       value: summary.labaBersih,  emoji: "📈", bg: "bg-emerald-100", color: "text-emerald-700" },
                ].map(({ label, value, emoji, bg, color }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>{emoji}</div>
                            <div>
                                <p className="text-xs text-gray-500">{label}</p>
                                <p className={`text-lg font-bold ${color}`}>
                                    {Number(value || 0) < 0
                                        ? <span className="text-red-500">- Rp {formatRp(Math.abs(value))}</span>
                                        : `Rp ${formatRp(value)}`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
                <h2 className="font-semibold text-gray-800 mb-4">
                    Rincian Transaksi ({filteredData.length} transaksi)
                </h2>

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
                                        <td className="py-3 px-4 text-[11px] text-gray-500">{row.tanggal}</td>
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

            {/* EXPORT MODAL */}
            {exportModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
                        <h3 className="font-semibold text-gray-800 mb-0.5">
                            Export {exportModal.type?.toUpperCase()}
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Pilih rentang data yang ingin diekspor</p>

                        {/* Mode Toggle */}
                        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
                            {[
                                { key: "tahun", label: "Per Tahun" },
                                { key: "bulan", label: "Per Bulan" },
                            ].map(({ key, label }) => (
                                <button key={key}
                                    onClick={() => setExportMode(key)}
                                    className={`flex-1 py-1.5 text-xs rounded-md transition font-medium ${
                                        exportMode === key
                                            ? "bg-white text-emerald-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Pilih Tahun */}
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1.5">Tahun</label>
                            <div className="flex flex-wrap gap-1.5">
                                {(tahunTersedia || []).map((y) => (
                                    <button key={y}
                                        onClick={() => setExportTahun(y)}
                                        className={`px-3 py-1 text-xs border rounded-lg transition ${
                                            exportTahun === y
                                                ? "border-emerald-500 text-emerald-600 bg-emerald-50 font-medium"
                                                : "border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
                                        }`}>
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pilih Bulan (hanya jika mode bulan) */}
                        {exportMode === "bulan" && (
                            <div className="mb-3">
                                <label className="block text-xs text-gray-500 mb-1.5">Bulan</label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {NAMA_BULAN.map(({ label, value }) => (
                                        <button key={value}
                                            onClick={() => setExportBulan(value)}
                                            className={`py-1.5 text-xs border rounded-lg transition ${
                                                exportBulan === value
                                                    ? "border-emerald-500 text-emerald-600 bg-emerald-50 font-medium"
                                                    : "border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
                                            }`}>
                                            {label.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview rentang & jumlah transaksi */}
                        <div className="bg-gray-50 rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                {getExportRange().start} &nbsp;→&nbsp; {getExportRange().end}
                            </span>
                            <span className="text-xs font-medium text-emerald-600">
                                {filteredDataByExportRange().length} transaksi
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setExportModal({ open: false, type: null })}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
                                Batal
                            </button>
                            <button
                                onClick={handleExportConfirm}
                                className="px-4 py-2 text-sm bg-[#1B8A3A] text-white rounded-lg hover:bg-[#156e2e]">
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </MainLayout>
    );
}
