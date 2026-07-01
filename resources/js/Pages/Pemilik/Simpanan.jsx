import { useState, useMemo, useEffect, memo } from "react";
import MainLayout from "../../layouts/Pemilik/MainLayout";
import { usePage, router, Link } from "@inertiajs/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import { ArrowLeft, Search } from "lucide-react";

// ─── Static ───────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;
const labelJenis = { pokok: "Pokok", wajib: "Wajib", pengambilan: "Pengambilan" };

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatRp(value) { return Number(value || 0).toLocaleString("id-ID"); }

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Simpanan() {
    const { totalSimpanan, breakdownJenis, perAnggota, filterAktif } = usePage().props;

    // ── State ─────────────────────────────────────────────────────────────────
    const [pageAnggota, setPageAnggota] = useState(1);
    const [cariAnggota, setCariAnggota] = useState(filterAktif?.cari_anggota || "");

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
            cari_anggota: overrides.cari_anggota ?? cariAnggota,
        }, { preserveState: true, preserveScroll: true, replace: true, only: ['perAnggota', 'filterAktif'] });
    };

    // ── DEBOUNCE: pencarian anggota ───────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => { fetchAnggota({ cari_anggota: cariAnggota }); }, 500);
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

            {/* TABEL SIMPANAN PER ANGGOTA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6 p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h2 className="font-semibold text-gray-800">
                        Simpanan per Anggota ({(perAnggota || []).length})
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama anggota..."
                                value={cariAnggota}
                                onChange={(e) => setCariAnggota(e.target.value)}
                                className="border rounded-lg pl-8 pr-3 py-1.5 text-xs w-56"
                            />
                        </div>
                        <ExportButtons onExport={doExportAnggota} />
                    </div>
                </div>

                {(perAnggota || []).length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">
                        Belum ada data anggota
                    </div>
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

        </MainLayout>
    );
}