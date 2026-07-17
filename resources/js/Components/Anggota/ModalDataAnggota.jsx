import { useForm } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField';
import ModalShell from './ModalShell';
import { Save, Users } from 'lucide-react';

export default function ModalDataAnggota({ data, onTutup }) {
    const form = useForm({
        nama_lengkap: data.nama_lengkap || '',
        alamat: data.alamat || '',
        no_telepon: data.no_telepon || '',
        status_keanggotaan: data.status_keanggotaan || 'aktif',
    });

    const simpan = (e) => {
        e.preventDefault();
        form.put(route('admin-anggota.data-anggota.update', data.id_anggota), {
            preserveScroll: true,
            onSuccess: onTutup,
        });
    };

    return (
        <ModalShell title="Edit Data & Status Anggota" subtitle={data.nama_lengkap} icon={Users} onTutup={onTutup} maxWidth="max-w-xl">
            <form onSubmit={simpan} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-base font-medium text-gray-600 mb-1.5">NIK (Nomor Induk Kependudukan)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-base cursor-not-allowed"
                            value={data.nik}
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-600 mb-1.5">Status Keanggotaan</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                            value={form.data.status_keanggotaan}
                            onChange={e => form.setData('status_keanggotaan', e.target.value)}
                        >
                            <option value="aktif">Aktif</option>
                            <option value="pasif">Pasif</option>
                            <option value="keluar">Keluar</option>
                        </select>
                        {form.errors.status_keanggotaan && <div className="text-red-500 text-sm mt-1">{form.errors.status_keanggotaan}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <InputField
                            label="Nama Lengkap"
                            value={form.data.nama_lengkap}
                            onChange={e => form.setData('nama_lengkap', e.target.value)}
                            error={form.errors.nama_lengkap}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-base font-medium text-gray-600 mb-1.5">Alamat</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                            rows="3"
                            value={form.data.alamat}
                            onChange={e => form.setData('alamat', e.target.value)}
                        />
                        {form.errors.alamat && <div className="text-red-500 text-sm mt-1">{form.errors.alamat}</div>}
                    </div>

                    <div className="md:col-span-2">
                        <InputField
                            label="No Telepon"
                            value={form.data.no_telepon}
                            onChange={e => form.setData('no_telepon', e.target.value)}
                            error={form.errors.no_telepon}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onTutup} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition">
                        Batal
                    </button>
                    <button type="submit" disabled={form.processing}
                        className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                        <Save size={18} />
                        {form.processing ? 'Menyimpan…' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
