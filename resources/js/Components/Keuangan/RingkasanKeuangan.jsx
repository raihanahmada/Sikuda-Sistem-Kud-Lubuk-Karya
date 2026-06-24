import { rupiah } from '@/utils/format';

export default function RingkasanKeuangan({ data }) {
    const kartu = [
        { judul: 'Rekening Kas KUD',       nilai: data.saldo_kas,        sub: 'Saldo saat ini', tema: 'kuning' },
        { judul: 'Total Kas Masuk',        nilai: data.kas_masuk_bulan,  sub: `Bulan ini (${data.label_bulan})`, tema: 'biru' },
        { judul: 'Total Kas Keluar',       nilai: data.kas_keluar_bulan, sub: `Bulan ini (${data.label_bulan})`, tema: 'merah' },
        { judul: 'Total Simpanan Anggota', nilai: data.total_simpanan,   sub: `Wajib: ${rupiah(data.simpanan_wajib)} • Pokok: ${rupiah(data.simpanan_pokok)}`, tema: 'hijau' },
    ];

    const warna = {
        kuning: 'from-amber-400 to-amber-500',
        biru:   'from-blue-500 to-blue-600',
        merah:  'from-red-500 to-red-600',
        hijau:  'from-green-600 to-green-700',
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kartu.map((k) => (
                <div key={k.judul} className={`stat rounded-xl bg-gradient-to-br ${warna[k.tema]} text-white shadow-sm`}>
                    <div className="stat-title text-xs font-medium uppercase tracking-wide text-white/80">{k.judul}</div>
                    <div className="stat-value text-2xl font-bold text-white">{rupiah(k.nilai)}</div>
                    <div className="stat-desc whitespace-normal text-xs text-white/70">{k.sub}</div>
                </div>
            ))}
        </div>
    );
}
