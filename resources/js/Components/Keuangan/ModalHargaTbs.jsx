import { useForm } from '@inertiajs/react';

export default function ModalHargaTbs({ hargaBerlaku, onTutup }) {
    const hariIni = new Date().toISOString().slice(0, 10);

    const form = useForm({
        harga_per_kg:  hargaBerlaku?.harga_per_kg ?? '',
        berlaku_mulai: hariIni,
    });

    const simpan = (e) => {
        e.preventDefault();
        form.post(route('admin-keuangan.harga-tbs.store'), {
            preserveScroll: true,
            onSuccess: onTutup,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <h2 className="mb-1 text-lg font-bold text-gray-900">Set Harga TBS</h2>
                <p className="mb-4 text-xs text-gray-400">
                    Harga baru berlaku untuk penjualan yang dicatat setelah ini. Penjualan lama tidak berubah.
                </p>

                <form onSubmit={simpan} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Harga per kg (Rp)</label>
                        <input type="number" min="1" value={form.data.harga_per_kg}
                            onChange={(e) => form.setData('harga_per_kg', e.target.value)}
                            placeholder="contoh: 2850"
                            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                form.errors.harga_per_kg ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`} />
                        {form.errors.harga_per_kg && <p className="mt-1 text-xs text-red-600">{form.errors.harga_per_kg}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Berlaku Mulai</label>
                        <input type="date" value={form.data.berlaku_mulai}
                            onChange={(e) => form.setData('berlaku_mulai', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onTutup}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">Batal</button>
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
