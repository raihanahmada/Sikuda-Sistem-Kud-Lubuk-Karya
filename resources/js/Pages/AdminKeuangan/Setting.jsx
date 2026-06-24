import { useForm, usePage } from '@inertiajs/react';
import KeuanganLayout from '@/Layouts/AdminKeuangan/KeuanganLayout';

export default function Setting() {
    const { auth, flash } = usePage().props;

    const profil = useForm({
        nama_pengguna: auth.user.nama_pengguna,
    });

    const password = useForm({
        kata_sandi_lama: '',
        kata_sandi_baru: '',
        kata_sandi_baru_confirmation: '',
    });

    const simpanProfil = (e) => {
        e.preventDefault();
        profil.put(route('admin-keuangan.setting.profil'), { preserveScroll: true });
    };

    const simpanPassword = (e) => {
        e.preventDefault();
        password.put(route('admin-keuangan.setting.password'), {
            preserveScroll: true,
            onSuccess: () => password.reset(),
        });
    };

    return (
        <KeuanganLayout title="Setting — Keuangan">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Setting</h1>

            {flash?.sukses && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
                    {flash.sukses}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Ubah Nama */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-bold text-gray-900">Ubah Nama Pengguna</h2>
                    <form onSubmit={simpanProfil} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Pengguna</label>
                            <input type="text" value={profil.data.nama_pengguna}
                                onChange={(e) => profil.setData('nama_pengguna', e.target.value)}
                                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                    profil.errors.nama_pengguna ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`} />
                            {profil.errors.nama_pengguna && <p className="mt-1 text-xs text-red-600">{profil.errors.nama_pengguna}</p>}
                        </div>
                        <button type="submit" disabled={profil.processing}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                            {profil.processing ? 'Menyimpan…' : 'Simpan Nama'}
                        </button>
                    </form>
                </div>

                {/* Ubah Password */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-bold text-gray-900">Ubah Password</h2>
                    <form onSubmit={simpanPassword} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Password Lama</label>
                            <input type="password" value={password.data.kata_sandi_lama}
                                onChange={(e) => password.setData('kata_sandi_lama', e.target.value)}
                                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                    password.errors.kata_sandi_lama ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`} />
                            {password.errors.kata_sandi_lama && <p className="mt-1 text-xs text-red-600">{password.errors.kata_sandi_lama}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Password Baru</label>
                            <input type="password" value={password.data.kata_sandi_baru}
                                onChange={(e) => password.setData('kata_sandi_baru', e.target.value)}
                                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                                    password.errors.kata_sandi_baru ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                }`} />
                            {password.errors.kata_sandi_baru && <p className="mt-1 text-xs text-red-600">{password.errors.kata_sandi_baru}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                            <input type="password" value={password.data.kata_sandi_baru_confirmation}
                                onChange={(e) => password.setData('kata_sandi_baru_confirmation', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                        </div>
                        <button type="submit" disabled={password.processing}
                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                            {password.processing ? 'Menyimpan…' : 'Ubah Password'}
                        </button>
                    </form>
                </div>
            </div>
        </KeuanganLayout>
    );
}
