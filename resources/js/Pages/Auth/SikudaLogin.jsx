import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function SikudaLogin({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pengguna: '',
        kata_sandi: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('sikuda.login.post'), {
            onFinish: () => reset('kata_sandi'),
        });
    };

    return (
        <AuthenticatedLayout title="Login — SIKUDA KUD Lubuk Karya" status={status}>
            {/* Judul */}
            <h1 className="mb-1 text-4xl font-bold text-gray-900">
                Selamat
            </h1>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
                Datang
            </h1>
            <p className="mb-8 text-sm text-gray-500">
                Masukkan Username &amp; Password Anda
            </p>

            <form onSubmit={submit} className="space-y-5">

                {/* Username */}
                <div>
                    <label
                        htmlFor="nama_pengguna"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Username
                    </label>
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
                        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                            errors.nama_pengguna
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-300 bg-white'
                        }`}
                    />
                    {errors.nama_pengguna && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.nama_pengguna}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label
                        htmlFor="kata_sandi"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Password
                    </label>
                    <input
                        id="kata_sandi"
                        type="password"
                        value={data.kata_sandi}
                        onChange={(e) =>
                            setData('kata_sandi', e.target.value)
                        }
                        placeholder="••••••••••"
                        autoComplete="current-password"
                        className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                            errors.kata_sandi
                                ? 'border-red-400 bg-red-50'
                                : 'border-gray-300 bg-white'
                        }`}
                    />
                    {errors.kata_sandi && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.kata_sandi}
                        </p>
                    )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                    />
                    <label
                        htmlFor="remember"
                        className="text-sm text-gray-600"
                    >
                        Remember for 30 days
                    </label>
                </div>

                {/* Tombol Login */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-md bg-green-700 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Memproses...' : 'Login'}
                </button>
            </form>
        </AuthenticatedLayout>
    );
}
