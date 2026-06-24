// import { useState } from "react";
// import {
//   Weight,
//   FlaskConical,
//   Truck,
//   Wallet,
//   Receipt,
//   HandCoins,
//   Boxes,
//   CheckCircle,
//   Clock,
// } from "lucide-react";
// import Sidebar from "../../Components/Pemilik/Sidebar";
// import Header from "../../Components/Pemilik/Header";

// // ─── Data ─────────────────────────────────────────────────────────────────────

// const dataSet = {
//   all: {
//     revenue: "Rp 4,32M",
//     expense: "Rp 3,11M",
//     profit: "Rp 1,21M",
//     target: 75,
//     chartReal: [70, 75, 88, 72, 92, 75],
//     chartTarget: [80, 85, 90, 75, 95, 100],
//     logs: [
//       { tgl: "05 Juni 2026", unit: "Unit RAM (TBS)", act: "Penerimaan TBS", desc: "Timbangan RAM Utama #3 - 4.2 Ton", val: "Rp 10.500.000", status: "Selesai", type: "success" },
//       { tgl: "04 Juni 2026", unit: "Unit Pabrik Pupuk", act: "Penjualan Pupuk", desc: "Faktur Penjualan Kelompok Tani B", val: "Rp 42.000.000", status: "Selesai", type: "success" },
//       { tgl: "04 Juni 2026", unit: "Jasa Transportasi", act: "Sewa Truk Armada", desc: "Pengantaran Hasil CPO ke Pabrik PKS", val: "Rp 6.800.000", status: "Selesai", type: "success" },
//       { tgl: "03 Juni 2026", unit: "Unit RAM (TBS)", act: "Pembayaran Supplier", desc: "Transfer Hasil Timbang TBS Anggota #A12", val: "Rp 8.120.000", status: "Selesai", type: "success" },
//       { tgl: "03 Juni 2026", unit: "Jasa Transportasi", act: "Bahan Bakar Solar", desc: "Pengisian BBM armada transportasi 02 & 05", val: "Rp 2.400.000", status: "Dalam Proses", type: "pending" },
//       { tgl: "02 Juni 2026", unit: "Unit Pabrik Pupuk", act: "Distribusi Bahan Baku", desc: "Bahan baku NPK Masuk Gudang Utama", val: "Rp 150.000.000", status: "Selesai", type: "success" },
//     ],
//   },
//   ram: {
//     revenue: "Rp 2,12M",
//     expense: "Rp 1,45M",
//     profit: "Rp 670Jt",
//     target: 70,
//     chartReal: [65, 70, 85, 68, 80, 70],
//     chartTarget: [80, 80, 90, 75, 90, 100],
//     logs: [
//       { tgl: "05 Juni 2026", unit: "Unit RAM (TBS)", act: "Penerimaan TBS", desc: "Timbangan RAM Utama #3 - 4.2 Ton", val: "Rp 10.500.000", status: "Selesai", type: "success" },
//       { tgl: "03 Juni 2026", unit: "Unit RAM (TBS)", act: "Pembayaran Supplier", desc: "Transfer Hasil Timbang TBS Anggota #A12", val: "Rp 8.120.000", status: "Selesai", type: "success" },
//       { tgl: "02 Juni 2026", unit: "Unit RAM (TBS)", act: "Kalibrasi Timbangan", desc: "Perawatan berkala mesin timbangan RAM digital", val: "Rp 1.500.000", status: "Selesai", type: "success" },
//       { tgl: "01 Juni 2026", unit: "Unit RAM (TBS)", act: "Penerimaan TBS", desc: "Penerimaan Timbangan TBS Anggota Koperasi #B05", val: "Rp 12.300.000", status: "Selesai", type: "success" },
//     ],
//   },
//   pupuk: {
//     revenue: "Rp 1,50M",
//     expense: "Rp 1,12M",
//     profit: "Rp 380Jt",
//     target: 72,
//     chartReal: [80, 80, 90, 80, 95, 72],
//     chartTarget: [90, 90, 100, 100, 100, 100],
//     logs: [
//       { tgl: "04 Juni 2026", unit: "Unit Pabrik Pupuk", act: "Penjualan Pupuk", desc: "Faktur Penjualan Kelompok Tani B", val: "Rp 42.000.000", status: "Selesai", type: "success" },
//       { tgl: "02 Juni 2026", unit: "Unit Pabrik Pupuk", act: "Distribusi Bahan Baku", desc: "Bahan baku NPK Masuk Gudang Utama", val: "Rp 150.000.000", status: "Selesai", type: "success" },
//       { tgl: "01 Juni 2026", unit: "Unit Pabrik Pupuk", act: "Penjualan Eceran", desc: "Penjualan Pupuk Organik Cair 120 Botol", val: "Rp 6.000.000", status: "Selesai", type: "success" },
//     ],
//   },
//   transport: {
//     revenue: "Rp 700Jt",
//     expense: "Rp 540Jt",
//     profit: "Rp 160Jt",
//     target: 83,
//     chartReal: [50, 60, 75, 55, 80, 83],
//     chartTarget: [60, 70, 80, 70, 90, 100],
//     logs: [
//       { tgl: "04 Juni 2026", unit: "Jasa Transportasi", act: "Sewa Truk Armada", desc: "Pengantaran Hasil CPO ke Pabrik PKS", val: "Rp 6.800.000", status: "Selesai", type: "success" },
//       { tgl: "03 Juni 2026", unit: "Jasa Transportasi", act: "Bahan Bakar Solar", desc: "Pengisian BBM armada transportasi 02 & 05", val: "Rp 2.400.000", status: "Dalam Proses", type: "pending" },
//       { tgl: "01 Juni 2026", unit: "Jasa Transportasi", act: "Servis Rutin", desc: "Ganti Oli armada truk Mitsubishi Fuso", val: "Rp 4.500.000", status: "Selesai", type: "success" },
//     ],
//   },
// };

// const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function UnitIcon({ unit, size = 16 }) {
//   if (unit.includes("RAM")) return <Weight size={size} className="text-emerald-500 shrink-0" />;
//   if (unit.includes("Pupuk")) return <FlaskConical size={size} className="text-amber-500 shrink-0" />;
//   return <Truck size={size} className="text-red-500 shrink-0" />;
// }

// function StatusBadge({ type, label }) {
//   if (type === "success") {
//     return (
//       <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
//         <CheckCircle size={11} /> {label}
//       </span>
//     );
//   }
//   return (
//     <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
//       <Clock size={11} /> {label}
//     </span>
//   );
// }

// function BarChart({ chartReal, chartTarget }) {
//   const maxValue = Math.max(...chartReal, ...chartTarget);

//   const realPoints = chartReal
//     .map((value, idx) => {
//       const x = (idx / (chartReal.length - 1)) * 100;
//       const y = 100 - (value / maxValue) * 100;
//       return `${x},${y}`;
//     })
//     .join(" ");

//   const targetPoints = chartTarget
//     .map((value, idx) => {
//       const x = (idx / (chartTarget.length - 1)) * 100;
//       const y = 100 - (value / maxValue) * 100;
//       return `${x},${y}`;
//     })
//     .join(" ");

//   return (
//     <div className="w-full">
//       <div className="relative h-72 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 p-4">

//         {/* SVG Chart */}
//         <svg
//           viewBox="0 0 100 100"
//           preserveAspectRatio="none"
//           className="w-full h-full"
//         >
//           {/* Grid */}
//           {[20, 40, 60, 80].map((line) => (
//             <line
//               key={line}
//               x1="0"
//               y1={line}
//               x2="100"
//               y2={line}
//               stroke="#e5e7eb"
//               strokeDasharray="2,2"
//               strokeWidth="0.3"
//             />
//           ))}

//           {/* Target */}
//           <polyline
//             fill="none"
//             stroke="#d1d5db"
//             strokeWidth="1.5"
//             points={targetPoints}
//           />

//           {/* Realisasi */}
//           <polyline
//             fill="none"
//             stroke="#10b981"
//             strokeWidth="2"
//             points={realPoints}
//           />

//           {/* Titik Realisasi */}
//           {chartReal.map((value, idx) => {
//             const x = (idx / (chartReal.length - 1)) * 100;
//             const y = 100 - (value / maxValue) * 100;

//             return (
//               <circle
//                 key={idx}
//                 cx={x}
//                 cy={y}
//                 r="1.8"
//                 fill="#10b981"
//               />
//             );
//           })}

//           {/* Titik Target */}
//           {chartTarget.map((value, idx) => {
//             const x = (idx / (chartTarget.length - 1)) * 100;
//             const y = 100 - (value / maxValue) * 100;

//             return (
//               <circle
//                 key={`t-${idx}`}
//                 cx={x}
//                 cy={y}
//                 r="1.5"
//                 fill="#d1d5db"
//               />
//             );
//           })}
//         </svg>

//         {/* Bulan */}
//         <div className="absolute bottom-0 left-0 right-0 flex justify-between px-5 pb-2">
//           {MONTHS.map((month) => (
//             <span
//               key={month}
//               className="text-xs text-gray-500 font-medium"
//             >
//               {month}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Legend */}
//       <div className="flex justify-end gap-6 mt-4 text-xs text-gray-500">
//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
//           Realisasi
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="w-3 h-3 rounded-full bg-gray-300"></span>
//           Target
//         </div>
//       </div>
//     </div>
//   );
// }
// // ─── Page Content ─────────────────────────────────────────────────────────────

// function LaporanContent() {
//   const [activeUnit, setActiveUnit] = useState("all");
//   const data = dataSet[activeUnit];

//   const tabs = [
//     { key: "all",       label: "Semua Unit",       Icon: Boxes,        iconClass: "text-[#1B5E20]"},
//     { key: "ram",       label: "Unit RAM (TBS)",    Icon: Weight,       iconClass: "text-emerald-500" },
//     { key: "pupuk",     label: "Unit Penjualan Pupuk", Icon: FlaskConical, iconClass: "text-amber-500" },
    
//   ];

//   const cards = [
//     {
//       label: "Total Pendapatan",
//       value: data.revenue,
//       sub: "+8.2% vs Bulan Lalu",
//       subColor: "text-green-600",
//       icon: Wallet,
//       iconBg: "bg-emerald-50 text-emerald-600",
//     },
//     {
//       label: "Total Pengeluaran",
//       value: data.expense,
//       sub: "+3.1% kenaikan biaya",
//       subColor: "text-red-500",
//       icon: Receipt,
//       iconBg: "bg-red-50 text-red-500",
//     },
//     {
//       label: "Keuntungan Bersih",
//       value: data.profit,
//       sub: "Margin 28% Sehat",
//       subColor: "text-green-600",
//       icon: HandCoins,
//       iconBg: "bg-amber-50 text-amber-600",
//     },
//   ];

//   const unitSummaries = [
//     {
//       label: "Unit RAM (TBS)",
//       sub: "Target: 450T Timbang",
//       achieved: "315T Capai",
//       pct: "70% Target",
//       Icon: Weight,
//       colors: {
//         bg: "bg-green-50/50",
//         border: "border-green-100",
//         iconBg: "bg-green-100 text-green-700",
//         textColor: "text-green-700",
//         badgeBg: "bg-green-100 text-green-800",
//       },
//     },
//     {
//       label: "Pabrik Pupuk",
//       sub: "Target: Rp 2,5 Miliar",
//       achieved: "Rp 1,8M Jual",
//       pct: "72% Target",
//       Icon: FlaskConical,
//       colors: {
//         bg: "bg-amber-50/50",
//         border: "border-amber-100",
//         iconBg: "bg-amber-100 text-amber-700",
//         textColor: "text-amber-700",
//         badgeBg: "bg-amber-100 text-amber-800",
//       },
//     },
//     {
//       label: "Transportasi",
//       sub: "Target: 12 Armada Aktif",
//       achieved: "10 Armada",
//       pct: "83% Target",
//       Icon: Truck,
//       colors: {
//         bg: "bg-red-50/50",
//         border: "border-red-100",
//         iconBg: "bg-red-100 text-red-700",
//         textColor: "text-red-700",
//         badgeBg: "bg-red-100 text-red-800",
//       },
//     },
//   ];

//   return (
//     <div className="space-y-5">

//       {/* Page Title Row */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold text-[#1B5E20]">Laporan Analisis Unit Usaha</h2>
//           <p className="text-xs text-gray-400 mt-0.5">Data berjalan per 05 Juni 2026</p>
//         </div>
//         <span className="text-xs bg-green-100 text-[#1B5E20] font-semibold px-3 py-1.5 rounded-full">
//           Juni 2026
//         </span>
//       </div>

//     {/* Tab Filter */}
//     <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">

//     {/* Label */}
//     <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mr-2">
//         <Boxes size={16} className="text-[#1B5E20]" />
//         <span>Filter Unit Usaha</span>
//     </div>

//     {tabs.map(({ key, label, Icon, iconClass }) => {
//         const isActive = activeUnit === key;

//         return (
//         <button
//             key={key}
//             onClick={() => setActiveUnit(key)}
//             className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-2xl transition-all duration-300 ${
//             isActive
//                 ? "bg-gradient-to-r from-emerald-50 to-green-100 text-[#1B5E20] border border-emerald-200 shadow-lg shadow-emerald-500/20"
//                 : "bg-gray-50 text-gray-600 border border-transparent hover:bg-gray-100 hover:border-gray-200"
//             }`}
//         >
//             <Icon
//             size={16}
//             className={
//                 isActive
//                 ? "text-[#1B5E20]"
//                 : iconClass
//             }
//             />

//             <span>{label}</span>
//         </button>
//         );
//     })}
//     </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         {cards.map(({ label, value, sub, subColor, icon: Icon, iconBg }) => (
//           <div
//             key={label}
//             className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
//           >
//             <div className="space-y-1.5">
//               <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
//                 {label}
//               </span>
//               <p className="text-2xl font-bold text-gray-900">{value}</p>
//               <p className={`text-xs flex items-center gap-1 ${subColor}`}>{sub}</p>
//             </div>
//             <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
//               <Icon size={20} />
//             </div>
//           </div>
//         ))}

//         {/* Target Card */}
//         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
//           <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
//             Capaian Target Unit
//           </span>
//           <div className="flex items-baseline gap-1.5 mt-1.5 mb-2">
//             <p className="text-2xl font-bold text-gray-900">{data.target}%</p>
//             <span className="text-xs text-gray-400">Rata-rata global</span>
//           </div>
//           <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
//             <div
//               className="bg-emerald-500 h-full rounded-full transition-all duration-500"
//               style={{ width: `${data.target}%` }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Chart + Unit Summaries */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* Bar Chart */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 space-y-3">
//           <div className="flex items-start justify-between">
//             <div>
//               <h3 className="font-bold text-gray-900">Grafik Performa Bulanan</h3>
//               <p className="text-xs text-gray-400">Realisasi vs Target Unit Usaha Aktif</p>
//             </div>
//             <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
//               <span className="flex items-center gap-1.5">
//                 <span className="w-3 h-3 bg-emerald-500 rounded-full" /> Realisasi
//               </span>
//               <span className="flex items-center gap-1.5">
//                 <span className="w-3 h-3 bg-gray-300 rounded-full" /> Target
//               </span>
//             </div>
//           </div>
//           <BarChart chartReal={data.chartReal} chartTarget={data.chartTarget} />
//           <p className="text-[11px] text-gray-400 italic">
//             * Data bulan Juni merupakan data berjalan (real-time) hingga tanggal 05 Juni 2026.
//           </p>
//         </div>

//         {/* Unit Summaries */}
//         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
//           <div>
//             <h3 className="font-bold text-gray-900">Ikhtisar Target & Status</h3>
//             <p className="text-xs text-gray-400">Kinerja operasional ketiga pilar bisnis KUD</p>
//           </div>
//           <div className="space-y-3 flex-1">
//             {unitSummaries.map(({ label, sub, achieved, pct, Icon, colors }) => (
//               <div
//                 key={label}
//                 className={`p-3 rounded-xl border flex items-center justify-between ${colors.bg} ${colors.border}`}
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${colors.iconBg}`}
//                   >
//                     <Icon size={16} />
//                   </div>
//                   <div>
//                     <p className="font-bold text-xs text-gray-800">{label}</p>
//                     <p className="text-[10px] text-gray-400">{sub}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <span className={`text-xs font-bold block ${colors.textColor}`}>{achieved}</span>
//                   <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors.badgeBg}`}>
//                     {pct}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Transaction Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
//           <div>
//             <h3 className="font-bold text-gray-900">Log Jurnal Transaksi Unit Usaha</h3>
//             <p className="text-xs text-gray-400">
//               Arus masuk, timbangan TBS, logistik armada, dan distribusi pupuk
//             </p>
//           </div>
//           <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
//             <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M3 3a2 2 0 012-2h6l5 5v12a2 2 0 01-2 2H5a2 2 0 01-2-2V3z" />
//             </svg>
//             Ekspor Laporan (.xls)
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="bg-gray-50 border-b border-gray-100">
//                 {[
//                   "Tanggal",
//                   "Unit Usaha",
//                   "Kategori/Aktivitas",
//                   "Detail Log",
//                   "Nilai Transaksi (IDR)",
//                   "Status",
//                 ].map((h, i) => (
//                   <th
//                     key={h}
//                     className={`p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${
//                       i === 0 ? "pl-6" : ""
//                     } ${i === 4 ? "text-right" : ""} ${i === 5 ? "text-center pr-6" : ""}`}
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {data.logs.map((log, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
//                   <td className="p-4 pl-6 text-sm font-medium text-gray-600 whitespace-nowrap">
//                     {log.tgl}
//                   </td>
//                   <td className="p-4 text-sm font-bold text-gray-800">
//                     <span className="flex items-center gap-2">
//                       <UnitIcon unit={log.unit} size={14} />
//                       {log.unit}
//                     </span>
//                   </td>
//                   <td className="p-4 text-sm font-semibold text-gray-600 whitespace-nowrap">
//                     {log.act}
//                   </td>
//                   <td className="p-4 text-sm text-gray-400 max-w-xs truncate">{log.desc}</td>
//                   <td className="p-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
//                     {log.val}
//                   </td>
//                   <td className="p-4 text-center pr-6">
//                     <StatusBadge type={log.type} label={log.status} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 px-6">
//           <span>
//             Menampilkan <strong>{data.logs.length}</strong> jurnal terkini
//           </span>
//           <div className="flex items-center gap-1">
//             <button
//               disabled
//               className="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-300 flex items-center justify-center cursor-not-allowed"
//             >
//               ‹
//             </button>
//             <button className="w-8 h-8 rounded-lg bg-[#1B5E20] text-white flex items-center justify-center shadow-sm">
//               1
//             </button>
//             <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center">
//               2
//             </button>
//             <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-colors flex items-center justify-center">
//               ›
//             </button>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// }

// // ─── Main Export (with Layout) ────────────────────────────────────────────────

// export default function LaporanUnitUsaha() {
//   const [activeMenu, setActiveMenu] = useState("Laporan Unit Usaha");

//   return (
//     <div className="flex h-screen bg-[#F2F4F3] font-sans text-[#333]">
//       <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

//       <main className="flex-1 flex flex-col h-screen overflow-hidden">
//         <Header />
//         <div className="flex-1 overflow-y-auto p-6">
//           <LaporanContent />
//         </div>
//       </main>
//     </div>
//   );
// }
