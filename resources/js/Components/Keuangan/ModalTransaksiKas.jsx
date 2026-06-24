import { useForm } from '@inertiajs/react';

export default function ModalTransaksiKas({ data, onTutup }) {
    const edit = Boolean(data);
    const hariIni = new Date().toISOString().slice(0, 10);

    const form = useForm({
        jenis_kas:         data?.jenis_kas ?? 'masuk',
        nominal:           data?.nominal ?? '',
        keterangan:        data?.keterangan ?? '',
        tanggal_transaksi: data?.tanggal_transaksi ?? hariIni,
    });

    const simpan = (e) => {
        e.preventDefault();
        const opsi = { preserveScroll: true, onSuccess: onTutup };
        if (edit) {
            form.put(route('admin-keuangan.kas-harian.update', data.id_transaksi), opsi);
        } else {
            form.post(route('admin-keuangan.kas-harian.store'), opsi);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                    {edit ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas'}
                </h2>

                <form onSubmit={simpan} className="space-y-4">
                    {/* Jenis Kas */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Kas</label>
                        <div className="flex gap-2">
                            {['masuk', 'keluar'].map((j) => (
                                <button type="button" key={j}
                                    onClick={() => form.setData('jenis_kas', j)}
                                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                                        form.data.jenis_kas === j
                                            ? j === 'masuk' ? 'border-green-600 bg-green-50 text-green-700'
                                                             : 'border-red-600 bg-red-50 text-red-700'
                                            : 'border-gray-200 text-gray-500'
                                    }`}>
                                    {j === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nominal */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nominal (Rp)</label>
                        <input type="number" min="1" value={form.data.nominal}
                            onChange={(e) => form.setData('nominal', e.target.value)}
                            placeholder="0"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                form.errors.nominal ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`} />
                        {form.errors.nominal && <p className="mt-1 text-xs text-red-600">{form.errors.nominal}</p>}
                    </div>

                    {/* Tanggal */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Transaksi</label>
                        <input type="date" value={form.data.tanggal_transaksi}
                            onChange={(e) => form.setData('tanggal_transaksi', e.target.value)}
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                form.errors.tanggal_transaksi ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`} />
                        {form.errors.tanggal_transaksi && <p className="mt-1 text-xs text-red-600">{form.errors.tanggal_transaksi}</p>}
                    </div>

                    {/* Keterangan */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Keterangan</label>
                        <textarea rows={2} value={form.data.keterangan}
                            onChange={(e) => form.setData('keterangan', e.target.value)}
                            placeholder="Contoh: Setoran simpanan wajib / Pembayaran listrik kantor"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                form.errors.keterangan ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`} />
                        {form.errors.keterangan && <p className="mt-1 text-xs text-red-600">{form.errors.keterangan}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onTutup}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
                            Batal
                        </button>
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
