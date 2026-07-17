import { useForm } from '@inertiajs/react';
import ModalShell from './ModalShell';
import SimpananFormFields from './SimpananFormFields';
import { Save, PiggyBank } from 'lucide-react';

// Modal "Tambah Simpanan" — dipanggil dari Simpanan/Index.jsx
export default function ModalSimpanan({ daftarAnggota = [], onTutup }) {
    const form = useForm({
        id_anggota: '',
        jenis_simpanan: 'wajib',
        jumlah: '',
        tanggal_transaksi: '',
        keterangan: '',
    });

    const simpan = (e) => {
        e.preventDefault();
        form.post(route('admin-anggota.simpanan.store'), { preserveScroll: true, onSuccess: onTutup });
    };

    return (
        <ModalShell title="Input Transaksi Simpanan" subtitle="KUD Lubuk Karya" icon={PiggyBank} onTutup={onTutup} maxWidth="max-w-xl">
            <form onSubmit={simpan} className="space-y-4">
                <SimpananFormFields data={form.data} setData={form.setData} errors={form.errors} daftarAnggota={daftarAnggota} />
                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onTutup} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition">
                        Batal
                    </button>
                    <button type="submit" disabled={form.processing}
                        className="inline-flex items-center gap-2 bg-[#1B8A3A] hover:bg-[#157030] text-white px-5 py-2.5 rounded-xl text-base font-semibold transition disabled:opacity-70">
                        <Save size={18} />
                        {form.processing ? 'Menyimpan…' : 'Simpan Transaksi'}
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
