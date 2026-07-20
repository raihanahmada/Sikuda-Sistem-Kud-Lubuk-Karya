import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import SearchableSelect from '@/Components/SearchableSelect';
import { rupiah, tanggalID } from '@/utils/format';

export default function ModalPenyaluranDana({ data, penjualanBelumSalur, onTutup }) {
    const edit = Boolean(data);
    const hariIni = new Date().toISOString().slice(0, 10);

    const form = useForm({
        id_penjualan:       data?.id_penjualan ?? '',
        total_potongan:     data?.total_potongan ?? '',
        tanggal_penyaluran: data?.tanggal_penyaluran ?? hariIni,
        keterangan:         data?.keterangan ?? '',
    });

    // Saat tambah: total dari penjualan terpilih. Saat edit: total tersimpan di record.
    const penjualanDipilih = useMemo(
        () => penjualanBelumSalur.find((p) => String(p.id_penjualan) === String(form.data.id_penjualan)),
        [form.data.id_penjualan, penjualanBelumSalur]
    );
    const totalPenjualan = edit ? data.total_penjualan : (penjualanDipilih?.total_nilai ?? 0);
    const danaBersih = totalPenjualan - (Number(form.data.total_potongan) || 0);
    const danaTidakValid = danaBersih <= 0 && form.data.total_potongan !== '';

    const simpan = (e) => {
        e.preventDefault();
        const opsi = { preserveScroll: true, onSuccess: onTutup };
        if (edit) {
            form.put(route('admin-keuangan.penyaluran-dana.update', data.id_penyaluran), opsi);
        } else {
            form.post(route('admin-keuangan.penyaluran-dana.store'), opsi);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                    {edit ? 'Edit Penyaluran Dana' : 'Salurkan Dana'}
                </h2>

                <form onSubmit={simpan} className="space-y-4">
                    {/* Penjualan TBS — hanya saat tambah; saat edit terkunci */}
                    {edit ? (
                        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                            <span className="text-gray-500 dark:text-gray-400">Anggota:</span>{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">{data.nama_anggota}</span>
                            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">Penjualan asal tidak dapat diubah saat edit</p>
                        </div>
                    ) : (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Penjualan TBS</label>
                            <SearchableSelect
                                options={penjualanBelumSalur.map((p) => ({
                                    value: p.id_penjualan,
                                    label: `${p.nama_anggota} — ${tanggalID(p.tanggal_timbang)} — ${rupiah(p.total_nilai)} (${p.berat_bersih_kg} kg)`,
                                }))}
                                value={form.data.id_penjualan}
                                onChange={(val) => form.setData('id_penjualan', val)}
                                placeholder="— Pilih penjualan TBS —"
                                error={Boolean(form.errors.id_penjualan)}
                            />
                            {form.errors.id_penjualan && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.id_penjualan}</p>}
                        </div>
                    )}

                    {/* Total penjualan (read-only) */}
                    <div className="flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">Total Penjualan TBS:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{rupiah(totalPenjualan)}</span>
                    </div>

                    {/* Potongan */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Total Potongan Biaya Kebun (Rp)</label>
                        <input type="number" step="0.01" min="0" value={form.data.total_potongan}
                            onChange={(e) => form.setData('total_potongan', e.target.value)}
                            placeholder="0"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${
                                form.errors.total_potongan || danaTidakValid ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`} />
                        {form.errors.total_potongan && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.total_potongan}</p>}
                    </div>

                    {/* Dana bersih (otomatis) */}
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Dana Bersih untuk Anggota:</span>
                            <span className={`font-semibold ${danaTidakValid ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-emerald-400'}`}>
                                {rupiah(danaBersih)}
                            </span>
                        </div>
                        {danaTidakValid
                            ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">Potongan terlalu besar — dana bersih nol/negatif.</p>
                            : <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">Total penjualan − potongan. Otomatis jadi kas keluar.</p>}
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Tanggal Penyaluran</label>
                        <input type="date" value={form.data.tanggal_penyaluran}
                            onChange={(e) => form.setData('tanggal_penyaluran', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 ${
                                form.errors.tanggal_penyaluran ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/15' : 'border-gray-300 dark:border-gray-700'
                            }`} />
                        {form.errors.tanggal_penyaluran && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{form.errors.tanggal_penyaluran}</p>}
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
                        <button type="submit" disabled={form.processing || danaTidakValid}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                            {form.processing ? 'Menyimpan…' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
