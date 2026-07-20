const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A] dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500";
const labelCls = "block text-base font-medium text-gray-600 mb-1.5 dark:text-gray-300";

// Dipakai bersama oleh ModalSimpanan (Tambah) dan ModalDetailSimpanan (Edit riwayat in-place)
export default function SimpananFormFields({ data, setData, errors, daftarAnggota }) {
    return (
        <>
            {daftarAnggota && (
                <div>
                    <label className={labelCls}>Pilih Anggota</label>
                    <select className={inputCls} value={data.id_anggota} onChange={e => setData('id_anggota', e.target.value)}>
                        <option value="">-- Pilih Anggota --</option>
                        {daftarAnggota.map(a => (
                            <option key={a.id_anggota} value={a.id_anggota}>{a.nik} - {a.nama_lengkap}</option>
                        ))}
                    </select>
                    {errors.id_anggota && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{errors.id_anggota}</div>}
                </div>
            )}

            <div>
                <label className={labelCls}>Jenis Transaksi</label>
                <select className={inputCls} value={data.jenis_simpanan} onChange={e => setData('jenis_simpanan', e.target.value)}>
                    <option value="wajib">Simpanan Wajib</option>
                    <option value="pokok">Simpanan Pokok</option>
                    <option value="pengambilan">Pengambilan / Penarikan</option>
                </select>
            </div>

            <div>
                <label className={labelCls}>Jumlah (Rp)</label>
                <input type="number" placeholder="Contoh: 50000" className={inputCls} value={data.jumlah} onChange={e => setData('jumlah', e.target.value)} />
                {errors.jumlah && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{errors.jumlah}</div>}
            </div>

            <div>
                <label className={labelCls}>Tanggal Transaksi</label>
                <input type="date" className={inputCls} value={data.tanggal_transaksi} onChange={e => setData('tanggal_transaksi', e.target.value)} />
                {errors.tanggal_transaksi && <div className="text-red-500 text-sm mt-1 dark:text-red-400">{errors.tanggal_transaksi}</div>}
            </div>

            <div>
                <label className={labelCls}>Keterangan</label>
                <textarea rows="3" placeholder="Catatan tambahan..." className={inputCls} value={data.keterangan} onChange={e => setData('keterangan', e.target.value)} />
            </div>
        </>
    );
}
