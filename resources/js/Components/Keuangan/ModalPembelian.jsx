import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import { rupiah } from '@/utils/format';
import SearchableSelect from '@/Components/SearchableSelect';
export default function ModalPembelian({ data, daftarAnggota, daftarBarang, onTutup }) {
    const edit = Boolean(data);
    const hariIni = new Date().toISOString().slice(0, 10);

    const form = useForm({
        id_anggota:        data?.id_anggota ?? '',
        id_barang:         data?.id_barang ?? '',
        jumlah:            data?.jumlah ?? '',
        tanggal_pembelian: data?.tanggal_pembelian ?? hariIni,
        keterangan:        data?.keterangan ?? '',
    });

    // Barang terpilih → tampilkan harga & hitung total (preview; total final dihitung server)
    const barangDipilih = useMemo(
        () => daftarBarang.find((b) => String(b.id_barang) === String(form.data.id_barang)),
        [form.data.id_barang, daftarBarang]
    );
    const totalPreview = barangDipilih && form.data.jumlah
        ? Number(form.data.jumlah) * Number(barangDipilih.harga_jual)
        : 0;

    // Sisa stok barang terpilih. Saat EDIT pada barang yang sama, stok efektif
    // bertambah karena jumlah lama akan dikembalikan dulu di server.
    const stokEfektif = useMemo(() => {
        if (!barangDipilih) return null;
        const sama = data && String(data.id_barang) === String(form.data.id_barang);
        return Number(barangDipilih.stok_tersedia) + (sama ? Number(data.jumlah) : 0);
    }, [barangDipilih, data, form.data.id_barang]);

    const stokKurang =
        stokEfektif !== null && form.data.jumlah !== '' &&
        Number(form.data.jumlah) > stokEfektif;

    const simpan = (e) => {
        e.preventDefault();
        const opsi = { preserveScroll: true, onSuccess: onTutup };
        if (edit) {
            form.put(route('admin-keuangan.pembelian.update', data.id_pembelian), opsi);
        } else {
            form.post(route('admin-keuangan.pembelian.store'), opsi);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                    {edit ? 'Edit Pembelian' : 'Tambah Pembelian'}
                </h2>

                <form onSubmit={simpan} className="space-y-4">
                    {/* Anggota */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Anggota</label>
                        <SearchableSelect
                            options={daftarAnggota.map((a) => ({ value: a.id_anggota, label: a.nama_lengkap }))}
                            value={form.data.id_anggota}
                            onChange={(val) => form.setData('id_anggota', val)}
                            placeholder="— Pilih anggota —"
                            error={Boolean(form.errors.id_anggota)}
                        />
                        {form.errors.id_anggota && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.id_anggota}</p>}
                    </div>

                    {/* Barang */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Barang</label>
                        <select value={form.data.id_barang}
                            onChange={(e) => form.setData('id_barang', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 ${
                                form.errors.id_barang ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`}>
                            <option value="">— Pilih barang —</option>
                            {daftarBarang.map((b) => (
                                <option key={b.id_barang} value={b.id_barang}>
                                    {b.kode_barang} — {b.nama_barang} ({rupiah(b.harga_jual)}/{b.satuan_default})
                                </option>
                            ))}
                        </select>
                        {form.errors.id_barang && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.id_barang}</p>}
                    </div>

                    {/* Jumlah */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Jumlah {barangDipilih ? `(${barangDipilih.satuan_default})` : ''}
                        </label>
                        <input type="number" step="0.01" min="0.01" value={form.data.jumlah}
                            onChange={(e) => form.setData('jumlah', e.target.value)}
                            placeholder="0"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${
                                form.errors.jumlah ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`} />
                        {form.errors.jumlah && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.jumlah}</p>}
                    </div>

                    {/* Preview total + info stok */}
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Total Harga:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{rupiah(totalPreview)}</span>
                        </div>
                        {barangDipilih && (
                            <div className="mt-1 flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Sisa stok:</span>
                                <span className={stokKurang ? 'font-semibold text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}>
                                    {stokEfektif} {barangDipilih.satuan_default}
                                </span>
                            </div>
                        )}
                        {stokKurang && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">Jumlah melebihi stok tersedia.</p>
                        )}
                        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">Total dihitung otomatis dari harga katalog × jumlah</p>
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Pembelian</label>
                        <input type="date" value={form.data.tanggal_pembelian}
                            onChange={(e) => form.setData('tanggal_pembelian', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${
                                form.errors.tanggal_pembelian ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`} />
                        {form.errors.tanggal_pembelian && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.tanggal_pembelian}</p>}
                    </div>

                    {/* Keterangan */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Keterangan (opsional)</label>
                        <textarea rows={2} value={form.data.keterangan}
                            onChange={(e) => form.setData('keterangan', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onTutup}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">Batal</button>
                        <button type="submit" disabled={form.processing || stokKurang}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                            {form.processing ? 'Menyimpan…' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
