import { useMemo, useState, memo, useEffect, useRef } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import MainLayout from "../../layouts/Pemilik/MainLayout";
import { ArrowLeft, Search, Users, Loader2 } from "lucide-react";

// ─── Custom Hook: useDebounce ──────────────────────────────────────────────
// Menahan perubahan "value" dan baru mengembalikan nilai terbarunya setelah
// user BERHENTI mengetik selama `delay` ms. Tiap ada perubahan value baru
// sebelum delay habis, timeout sebelumnya di-clear dan dimulai dari awal lagi.
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup: dipanggil tiap "value" berubah lagi SEBELUM delay habis,
    // jadi timeout lama dibatalkan (clearTimeout) dan mulai hitung dari nol.
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

// ─── Badge Status ─────────────────────────────────────────────────────────────

const BadgeStatus = memo(function BadgeStatus({ status }) {
  const config = {
    aktif       : { label: "Aktif",       bg: "#E8F5E9", color: "#1B8A3A" },
    pasif       : { label: "Pasif",       bg: "#FEF3C7", color: "#D97706" },
    tidak_aktif : { label: "Tidak Aktif", bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = config[status] || { label: status, bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
});

// ─── Halaman Anggota ──────────────────────────────────────────────────────────

export default function Anggota() {
  const { anggota, statistik } = usePage().props;

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [isSearching, setIsSearching]   = useState(false);

  // "search" di-debounce 500ms — request ke API baru jalan kalau user udah
  // berhenti ngetik selama 500ms. filterStatus gak perlu di-debounce karena
  // perubahannya dari klik tombol (1 aksi diskrit), bukan ketikan beruntun.
  const debouncedSearch = useDebounce(search, 500);

  // Biar request ke server gak langsung jalan pas komponen pertama kali
  // mount (data awal sudah dikirim server lewat props).
  const isFirstRender = useRef(true);

  // ─── useEffect: panggil API ketika debouncedSearch / filterStatus berubah ──
  // Karena "search" sudah lewat useDebounce, effect ini cuma jalan SEKALI
  // setelah user selesai mengetik — bukan tiap huruf yang diketik — sehingga
  // server tidak dibebani request yang tidak perlu.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsSearching(true);

    router.get(
      window.location.pathname,
      {
        cari: debouncedSearch || undefined,
        status: filterStatus !== "semua" ? filterStatus : undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ["anggota", "statistik"],
        onFinish: () => setIsSearching(false),
      }
    );
  }, [debouncedSearch, filterStatus]);

  // Data sudah difilter di server (lewat controller), jadi dipakai apa adanya.
  const dataAnggota = useMemo(() => anggota || [], [anggota]);

  // Indikator loading: nyala selagi nunggu debounce ATAU nunggu response server.
  const isWaiting = search !== debouncedSearch || isSearching;

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/pemilik/dashboard">
          <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
            <ArrowLeft size={16} className="text-gray-500" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Data Anggota</h1>
          <p className="text-[11px] text-gray-400">KUD Lubuk Karya</p>
        </div>
      </div>

      {/* STATISTIK CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Anggota", value: statistik?.total       || 0, color: "#3B82F6" },
          { label: "Aktif",         value: statistik?.aktif       || 0, color: "#1B8A3A" },
          { label: "Pasif",         value: statistik?.pasif       || 0, color: "#D97706" },
          { label: "Tidak Aktif",   value: statistik?.tidak_aktif || 0, color: "#DC2626" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[11px] text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          {isWaiting ? (
            <Loader2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
          ) : (
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            type="text"
            placeholder="Cari nama, NIK, atau no. surat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20"
          />
        </div>
        <div className="flex gap-2">
          {["semua", "aktif", "pasif", "tidak_aktif"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-[11px] rounded-xl border transition ${
                filterStatus === s
                  ? "bg-[#1B8A3A] text-white border-[#1B8A3A]"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s === "semua" ? "Semua" : s === "aktif" ? "Aktif" : s === "pasif" ? "Pasif" : "Tidak Aktif"}
            </button>
          ))}
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {dataAnggota.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Users size={40} className="mb-3" />
            <p className="text-sm italic">Tidak ada data anggota</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">No. Surat</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">NIK</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">Nama Lengkap</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">Alamat</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">No. Telepon</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">Tgl. Daftar</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">Tgl. Verifikasi</th>
                  <th className="text-left text-[11px] text-gray-400 font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dataAnggota.map((a, i) => (
                  <tr key={a.id_anggota} className={`border-b border-gray-50 hover:bg-gray-50 transition ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 text-[11px] text-gray-500">{a.no_surat_permohonan || "-"}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-600">{a.nik}</td>
                    <td className="px-4 py-3 text-[12px] font-medium text-gray-800">{a.nama_lengkap}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[150px] truncate">{a.alamat || "-"}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">{a.no_telepon || "-"}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">
                      {a.tanggal_daftar ? new Date(a.tanggal_daftar).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-gray-500">
                      {a.tanggal_verifikasi ? new Date(a.tanggal_verifikasi).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeStatus status={a.status_keanggotaan} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER COUNT */}
      <p className="text-[11px] text-gray-400 mt-3 text-right">
        Menampilkan {dataAnggota.length} dari {statistik?.total || 0} anggota
      </p>

    </MainLayout>
  );
}
