import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm } from '@inertiajs/react';

export default function Index({ pengaturan }) {
    // Pastikan nilai default sinkron dengan database
    const { data, setData, post, processing } = useForm({
        tema: pengaturan?.tema || 'Terang',
        notifikasi: pengaturan?.notifikasi ? true : false,
        jumlah_data: pengaturan?.jumlah_data_per_halaman || 10
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pengaturan.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AdminAnggotaLayout title="Pengaturan">
            <div className="bg-white p-6 rounded-xl shadow max-w-2xl">
                <h2 className="text-xl font-bold mb-6">Pengaturan Admin Anggota</h2>
                
                <form onSubmit={submit} className="space-y-6">
                    {/* Tema */}
                    <div>
                        <label className="block font-medium mb-1">Tema Tampilan</label>
                        <select 
                            className="border p-2 rounded w-full"
                            value={data.tema}
                            onChange={(e) => setData('tema', e.target.value)}
                        >
                            <option value="Terang">Terang</option>
                            <option value="Gelap">Gelap</option>
                        </select>
                    </div>

                    {/* Notifikasi */}
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id="notifikasi"
                            className="mr-2 h-4 w-4"
                            checked={data.notifikasi}
                            onChange={(e) => setData('notifikasi', e.target.checked)}
                        />
                        <label htmlFor="notifikasi" className="font-medium">Aktifkan Notifikasi Sistem</label>
                    </div>

                    {/* Jumlah Data */}
                    <div>
                        <label className="block font-medium mb-1">Jumlah Data per Halaman</label>
                        <input 
                            type="number" 
                            className="border p-2 rounded w-full"
                            value={data.jumlah_data}
                            onChange={(e) => setData('jumlah_data', e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                    >
                        {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </form>
            </div>
        </AdminAnggotaLayout>
    );
}