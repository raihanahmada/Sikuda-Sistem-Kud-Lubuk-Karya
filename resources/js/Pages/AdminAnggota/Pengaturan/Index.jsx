import { useState, useEffect, useRef } from 'react';
import AdminAnggotaLayout from '@/Layouts/AdminAnggotaLayout';
import { useForm, usePage } from '@inertiajs/react';
import InputField from '@/Components/anggota/InputField';
import {
    User, Shield, Lock, Save, Loader2,
    CheckCircle2, AlertCircle, Eye, EyeOff,
    ChevronRight, X
} from 'lucide-react';

// ===== PENERAPAN MATERI: Reusable Component (Pertemuan 3) =====
// Notifikasi adalah child component reusable untuk tampilan flash message
function Notifikasi({ notif }) {
    if (!notif) return null;
    const sukses = notif.type === 'success';
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
            sukses
                ? 'bg-emerald-50 text-green-900 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
            {sukses
                ? <CheckCircle2 size={18} className="text-green-700 shrink-0" />
                : <AlertCircle size={18} className="text-rose-500 shrink-0" />
            }
            <span>{notif.message}</span>
        </div>
    );
}

// ===== PENERAPAN MATERI: Reusable Component PasswordField (Pertemuan 3) =====
function PasswordField({ label, placeholder, value, onChange, visible, onToggle, error, hint }) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-4 ${
                        error
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                            : 'border-gray-200 focus:border-green-700 focus:ring-green-700/10'
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-800 transition-colors"
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
            {!error && hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}
// ===== AKHIR REUSABLE COMPONENT =====

export default function Index({ pengaturan, user }) {

    const [notif, setNotif] = useState(null);
    const passwordModalRef = useRef(null);
    const [passwordFormError, setPasswordFormError] = useState('');
    const [showPassword, setShowPassword] = useState({ lama: false, baru: false, konfirmasi: false });

    // Auto-hapus notifikasi setelah 3 detik
    useEffect(() => {
        if (!notif) return;
        const timer = setTimeout(() => setNotif(null), 3000);
        return () => clearTimeout(timer);
    }, [notif]);

    // ===== PENERAPAN MATERI: Reusable Component InputField (Pertemuan 3) =====
    // Form profil
    const { data: profilData, setData: setProfilData, put: putProfil, processing: profilProcessing, errors: profilErrors } = useForm({
        nama_admin: pengaturan?.nama_admin || '',
        email:      pengaturan?.email      || '',
        no_telepon: pengaturan?.no_telepon || '',
    });

    // Form password
    const { data: passData, setData: setPassData, put: putPass, processing: passProcessing, errors: passErrors, reset: resetPass } = useForm({
        password_lama:       '',
        password_baru:       '',
        konfirmasi_password: '',
    });

    const submitProfil = (e) => {
        e.preventDefault();
        putProfil(route('admin-anggota.pengaturan.profil'), {
            preserveScroll: true,
            onSuccess: () => setNotif({ type: 'success', message: 'Profil berhasil diperbarui.' }),
            onError: () => setNotif({ type: 'error', message: 'Gagal menyimpan profil.' }),
        });
    };

    const toggleShowPassword = (field) =>
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

    const { password_lama, password_baru, konfirmasi_password } = passData;

    // ===== PENERAPAN MATERI: Conditional Rendering (Pertemuan 3) =====
    const passwordBaruError = !password_baru ? '' :
        password_lama && password_baru === password_lama ? 'Password baru tidak boleh sama dengan password lama.' :
        password_baru.length < 8 ? 'Password baru minimal 8 karakter.' : '';

    const konfirmasiError = konfirmasi_password && konfirmasi_password !== password_baru
        ? 'Konfirmasi password tidak cocok.' : '';

    const openPasswordModal = () => {
        setPasswordFormError('');
        passwordModalRef.current?.showModal();
    };

    const closePasswordModal = () => passwordModalRef.current?.close();

    const resetPasswordForm = () => {
        setPasswordFormError('');
        resetPass();
        setShowPassword({ lama: false, baru: false, konfirmasi: false });
    };

    const handleSavePassword = () => {
        setPasswordFormError('');
        if (!password_lama || !password_baru || !konfirmasi_password)
            return setPasswordFormError('Lengkapi semua kolom password.');
        if (passwordBaruError || konfirmasiError)
            return setPasswordFormError('Periksa kembali isian password di atas.');

        putPass(route('admin-anggota.pengaturan.password'), {
            preserveScroll: true,
            onSuccess: () => {
                closePasswordModal();
                setNotif({ type: 'success', message: 'Password berhasil diubah.' });
            },
            onError: (errors) => {
                const pesan = errors?.password_lama || errors?.password_baru || errors?.konfirmasi_password;
                setPasswordFormError(pesan || 'Gagal mengubah password.');
            },
        });
    };

    const inisial = (pengaturan?.nama_admin || user?.nama_pengguna || 'A').charAt(0).toUpperCase();

    return (
        <AdminAnggotaLayout title="Pengaturan">
            <div className="max-w-4xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-700 to-green-800 bg-clip-text text-transparent">
                        Pengaturan Akun
                    </h1>
                    <p className="text-sm text-gray-400 mt-1.5 font-medium">
                        Kelola preferensi dan keamanan akun sistem Anda
                    </p>
                </div>

                <Notifikasi notif={notif} />

                {/* ===== FORM PROFIL ===== */}
                <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-2xl">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                            <div className="p-2 bg-green-700/10 rounded-lg">
                                <User size={20} className="text-green-800" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Informasi Akun</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 items-start">
                            {/* Avatar */}
                            <div className="relative group shrink-0 mx-auto sm:mx-0">
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-700 to-green-800 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
                                <div className="bg-gradient-to-br from-green-700 to-green-800 text-white rounded-full w-28 h-28 flex items-center justify-center ring-4 ring-white relative shadow-lg">
                                    <span className="text-5xl font-extrabold leading-none">{inisial}</span>
                                </div>
                            </div>

                            {/* Fields */}
                            <form onSubmit={submitProfil} className="w-full space-y-4">
                                {/* ===== PENERAPAN MATERI: Memanggil Reusable Component InputField ===== */}
                                <InputField
                                    label="Nama Admin"
                                    value={profilData.nama_admin}
                                    onChange={e => setProfilData('nama_admin', e.target.value)}
                                    error={profilErrors.nama_admin}
                                    placeholder="Nama lengkap admin"
                                />
                                <InputField
                                    label="Email"
                                    type="email"
                                    value={profilData.email}
                                    onChange={e => setProfilData('email', e.target.value)}
                                    error={profilErrors.email}
                                    placeholder="Email admin"
                                />
                                <InputField
                                    label="No Telepon"
                                    value={profilData.no_telepon}
                                    onChange={e => setProfilData('no_telepon', e.target.value)}
                                    error={profilErrors.no_telepon}
                                    placeholder="No telepon (opsional)"
                                />
                                {/* ================================================================ */}

                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Role Pengguna</p>
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-green-700/30 bg-green-700/5 text-sm font-semibold text-green-800">
                                            <Shield size={14} />
                                            Admin Anggota
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Username</p>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {pengaturan?.username || user?.nama_pengguna}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={profilProcessing}
                                        className="flex items-center gap-2 px-8 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 rounded-xl shadow-lg shadow-green-700/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
                                    >
                                        {profilProcessing
                                            ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                                            : <><Save size={18} /> Simpan Perubahan</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ===== KEAMANAN AKUN ===== */}
                <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-2xl overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-2">
                            <div className="p-2 bg-green-700/10 rounded-lg">
                                <Shield size={20} className="text-green-800" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Keamanan Akun</h2>
                        </div>
                    </div>

                    <div className="px-4 pb-6 sm:px-6">
                        <button
                            type="button"
                            onClick={openPasswordModal}
                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group border border-transparent hover:border-gray-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-green-700/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-700/20 transition-all duration-300">
                                    <Lock size={22} className="text-green-800" />
                                </div>
                                <div className="text-left">
                                    <p className="text-base font-bold text-gray-800">Ubah Password</p>
                                    <p className="text-sm text-gray-400 mt-0.5">Tingkatkan keamanan dengan kata sandi baru</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shadow-sm group-hover:bg-green-700 group-hover:text-white transition-all duration-300">
                                <ChevronRight size={20} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* ===== INFORMASI SISTEM ===== */}
                <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/30 rounded-2xl">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Informasi Sistem
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                <p className="text-xs text-gray-400 font-medium">Nama Sistem</p>
                                <p className="text-sm font-bold text-gray-800">Sistem Informasi KUD Lubuk Karya</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-1">
                                <p className="text-xs text-gray-400 font-medium">Versi</p>
                                <p className="text-sm font-bold text-gray-800">v1.0.0 (Release)</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* ===== MODAL UBAH PASSWORD ===== */}
            <dialog ref={passwordModalRef} className="modal" onClose={resetPasswordForm}>
                <div className="modal-box relative bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-400 hover:bg-gray-100">
                            <X size={18} />
                        </button>
                    </form>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-green-700/10 rounded-xl">
                            <Lock size={22} className="text-green-800" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-xl text-gray-800">Ubah Password</h3>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Pastikan gunakan kata sandi yang kuat</p>
                        </div>
                    </div>

                    {/* ===== PENERAPAN MATERI: Conditional Rendering (Pertemuan 3) ===== */}
                    {passwordFormError && (
                        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm py-3 px-4 rounded-xl mb-5 shadow-sm">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span className="font-medium">{passwordFormError}</span>
                        </div>
                    )}
                    {/* ================================================================ */}

                    <div className="space-y-3">
                        <PasswordField
                            label="Password Lama"
                            placeholder="Masukkan password lama"
                            value={password_lama}
                            onChange={e => setPassData('password_lama', e.target.value)}
                            visible={showPassword.lama}
                            onToggle={() => toggleShowPassword('lama')}
                            error={passErrors?.password_lama}
                        />
                        <hr className="border-gray-100 my-1" />
                        <PasswordField
                            label="Password Baru"
                            placeholder="Masukkan password baru"
                            value={password_baru}
                            onChange={e => setPassData('password_baru', e.target.value)}
                            visible={showPassword.baru}
                            onToggle={() => toggleShowPassword('baru')}
                            error={passwordBaruError || passErrors?.password_baru}
                            hint="Minimal 8 karakter, berbeda dari password lama."
                        />
                        <PasswordField
                            label="Konfirmasi Password Baru"
                            placeholder="Ulangi password baru"
                            value={konfirmasi_password}
                            onChange={e => setPassData('konfirmasi_password', e.target.value)}
                            visible={showPassword.konfirmasi}
                            onToggle={() => toggleShowPassword('konfirmasi')}
                            error={konfirmasiError || passErrors?.konfirmasi_password}
                        />
                    </div>

                    <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={closePasswordModal}
                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSavePassword}
                            disabled={passProcessing}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 shadow-lg shadow-green-700/30 transition-all disabled:opacity-70"
                        >
                            {passProcessing
                                ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                                : <><Save size={18} /> Simpan Password</>
                            }
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop bg-gray-300/40 backdrop-blur-sm">
                    <button type="submit">close</button>
                </form>
            </dialog>

        </AdminAnggotaLayout>
    );
}