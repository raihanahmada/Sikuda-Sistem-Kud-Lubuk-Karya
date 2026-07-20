import { useForm } from '@inertiajs/react';
import SearchableSelect from '@/Components/SearchableSelect';
import { rupiah } from '@/utils/format';

export default function ModalPenjualanTbs({ data, hargaBerlaku, daftarAnggota, onTutup }) {
    const edit = Boolean(data);
    const hariIni = new Date().toISOString().slice(0, 10);

    // Saat edit: total dihitung dgn harga snapshot record. Saat tambah: harga berlaku.
    const hargaDipakai = edit ? data.harga_per_kg : (hargaBerlaku?.harga_per_kg ?? 0);

    const form = useForm({
        id_anggota:      data?.id_anggota ?? '',
        berat_bersih_kg: data?.berat_bersih_kg ?? '',
        tanggal_timbang: data?.tanggal_timbang ?? hariIni,
    });

    const totalPreview = form.data.berat_bersih_kg
        ? Number(form.data.berat_bersih_kg) * Number(hargaDipakai)
        : 0;

    const simpan = (e) => {
        e.preventDefault();
        const opsi = { preserveScroll: true, onSuccess: onTutup };
        if (edit) {
            form.put(route('admin-keuangan.penjualan-tbs.update', data.id_penjualan), opsi);
        } else {
            form.post(route('admin-keuangan.penjualan-tbs.store'), opsi);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                    {edit ? 'Edit Penjualan TBS' : 'Tambah Penjualan TBS'}
                </h2>

                <form onSubmit={simpan} className="space-y-4">
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

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Berat Bersih (kg)</label>
                        <input type="number" step="0.01" min="0.01" value={form.data.berat_bersih_kg}
                            onChange={(e) => form.setData('berat_bersih_kg', e.target.value)}
                            placeholder="0"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${
                                form.errors.berat_bersih_kg ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`} />
                        {form.errors.berat_bersih_kg && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.berat_bersih_kg}</p>}
                    </div>

                    {/* Preview total (harga otomatis dari setting) */}
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Harga/kg:</span>
                            <span className="text-gray-700 dark:text-gray-300">{rupiah(hargaDipakai)}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Total Nilai:</span>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">{rupiah(totalPreview)}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                            {edit ? 'Memakai harga saat transaksi dicatat' : 'Memakai harga TBS yang berlaku'}
                        </p>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Timbang</label>
                        <input type="date" value={form.data.tanggal_timbang}
                            onChange={(e) => form.setData('tanggal_timbang', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${
                                form.errors.tanggal_timbang ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`} />
                        {form.errors.tanggal_timbang && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.tanggal_timbang}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onTutup}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">Batal</button>
                        <button type="submit" disabled={form.processing}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                            {form.processing ? 'Menyimpan…' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
