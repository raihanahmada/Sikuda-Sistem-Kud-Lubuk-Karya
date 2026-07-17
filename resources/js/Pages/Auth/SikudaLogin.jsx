import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function SikudaLogin({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pengguna: '',
        kata_sandi: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('sikuda.login.post'), {
            onFinish: () => reset('kata_sandi'),
        });
    };

    return (
        <AuthenticatedLayout title="Login — SIKUDA KUD Lubuk Karya" status={status}>
            {/* Judul */}
            <h1 className="mb-1 text-3xl font-bold text-gray-900">
                Selamat Datang
            </h1>
            <p className="mb-7 text-sm text-gray-400">
                Masukkan username &amp; password Anda untuk melanjutkan
            </p>

            <form onSubmit={submit} className="space-y-4">

                {/* Username */}
                <div>
                    <label
                        htmlFor="nama_pengguna"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Username
                    </label>
                    <div className="relative">
                        <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            id="nama_pengguna"
                            type="text"
                            value={data.nama_pengguna}
                            onChange={(e) =>
                                setData('nama_pengguna', e.target.value)
                            }
                            placeholder="Masukkan username"
                            autoComplete="username"
                            autoFocus
                            className={`w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 ${
                                errors.nama_pengguna
                                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                                    : 'border-gray-200 bg-white focus:border-[#1B8A3A]'
                            }`}
                        />
                    </div>
                    {errors.nama_pengguna && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {errors.nama_pengguna}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor="kata_sandi"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input
                            id="kata_sandi"
                            type={showPassword ? 'text' : 'password'}
                            value={data.kata_sandi}
                            onChange={(e) =>
                                setData('kata_sandi', e.target.value)
                            }
                            placeholder="••••••••••"
                            autoComplete="current-password"
                            className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 ${
                                errors.kata_sandi
                                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                                    : 'border-gray-200 bg-white focus:border-[#1B8A3A]'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            tabIndex={-1}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.kata_sandi && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {errors.kata_sandi}
                        </p>
                    )}
                </div>

                {/* Tombol Login */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#22A94F] to-[#146830] py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:from-[#1F9847] hover:to-[#0F5C26] focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Memproses...' : 'Masuk'}
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
