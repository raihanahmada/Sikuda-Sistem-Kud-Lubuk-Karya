import { useState, useEffect, useRef } from "react";
import { usePage, useForm } from "@inertiajs/react";
import MainLayout from "../../layouts/Pemilik/MainLayout";

import {
  User,
  Shield,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight,
  X,
} from "lucide-react";

function Notifikasi({ notif }) {
  if (!notif) return null;
  const sukses = notif.type === "success";
  return (
    <div
      role="alert"
      className={`alert flex items-center shadow-sm rounded-xl py-3 border backdrop-blur-md ${
        sukses
          ? "bg-emerald-50/80 text-emerald-700 border-emerald-200"
          : "bg-rose-50/80 text-rose-700 border-rose-200"
      }`}
    >
      {sukses ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-rose-500" />}
      <span className="font-medium">{notif.message}</span>
    </div>
  );
}

function PasswordField({ label, placeholder, value, onChange, visible, onToggle, error, hint }) {
  return (
    <div className="form-control w-full">
      <label className="label py-1.5">
        <span className="label-text font-medium text-base-content/80">{label}</span>
      </label>
      <div className="relative group">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`input input-bordered w-full pr-10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
            error
              ? "border-error focus:border-error focus:ring-error/20"
              : "border-base-300 focus:border-primary focus:ring-primary/20"
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-primary transition-colors"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error ? (
        <label className="label py-1">
          <span className="label-text-alt text-error font-medium">{error}</span>
        </label>
      ) : hint ? (
        <label className="label py-1">
          <span className="label-text-alt text-base-content/50">{hint}</span>
        </label>
      ) : null}
    </div>
  );
}

export default function Pengaturan() {
  const { auth } = usePage().props;
  const [notif, setNotif] = useState(null);

  // Auto-hapus notifikasi setelah 3 detik
  useEffect(() => {
    if (!notif) return;
    const timer = setTimeout(() => setNotif(null), 3000);
    return () => clearTimeout(timer);
  }, [notif]);

  // ─── Form profil ───────────────────────────────────────────────────────
  const profileForm = useForm({ nama_pengguna: auth?.user?.nama_pengguna || "" });

  const tidakAdaPerubahan =
    profileForm.data.nama_pengguna.trim() === (auth?.user?.nama_pengguna || "").trim();

  const handleSaveProfile = () => {
    if (tidakAdaPerubahan) return;

    profileForm.post(route("pemilik.pengaturan.update"), {
      preserveScroll: true,
      onSuccess: () => setNotif({ type: "success", message: "Profil berhasil diperbarui." }),
      onError: (errors) => {
        if (!errors?.nama_pengguna)
          setNotif({ type: "error", message: "Gagal menyimpan profil. Periksa kembali data Anda." });
      },
    });
  };

  // ─── Form ganti password ───────────────────────────────────────────────
  const passwordForm = useForm({ password_lama: "", password_baru: "", konfirmasi_password: "" });
  const passwordModalRef = useRef(null);
  const [passwordFormError, setPasswordFormError] = useState("");
  const [showPassword, setShowPassword] = useState({ lama: false, baru: false, konfirmasi: false });

  const toggleShowPassword = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const { password_lama, password_baru, konfirmasi_password } = passwordForm.data;

  const passwordBaruError = !password_baru
    ? ""
    : password_lama && password_baru === password_lama
    ? "Password baru tidak boleh sama dengan password lama."
    : password_baru.length < 8
    ? "Password baru minimal 8 karakter."
    : "";

  const konfirmasiError =
    konfirmasi_password && konfirmasi_password !== password_baru
      ? "Konfirmasi password tidak cocok dengan password baru."
      : "";

  const openPasswordModal = () => {
    setPasswordFormError("");
    passwordForm.clearErrors();
    passwordModalRef.current?.showModal();
  };

  const closePasswordModal = () => passwordModalRef.current?.close();

  const resetPasswordForm = () => {
    setPasswordFormError("");
    passwordForm.reset();
    passwordForm.clearErrors();
    setShowPassword({ lama: false, baru: false, konfirmasi: false });
  };

  const handleSavePassword = () => {
    setPasswordFormError("");

    if (!password_lama || !password_baru || !konfirmasi_password)
      return setPasswordFormError("Lengkapi semua kolom password.");
    if (passwordBaruError || konfirmasiError)
      return setPasswordFormError("Periksa kembali isian password di atas.");

    passwordForm.post(route("pemilik.pengaturan.update"), {
      preserveScroll: true,
      onSuccess: () => {
        closePasswordModal();
        setNotif({ type: "success", message: "Password berhasil diubah." });
      },
      onError: (errors) => {
        // Tampilkan pesan error field kalau ada, fallback kalau tidak ada
        const pesanField =
          errors?.password_lama || errors?.password_baru || errors?.konfirmasi_password;
        if (pesanField) {
          setPasswordFormError(pesanField);
        } else {
          setPasswordFormError("Gagal mengubah password. Periksa kembali data Anda.");
        }
      },
    });
  };

  const inisial = profileForm.data.nama_pengguna
    ? profileForm.data.nama_pengguna.charAt(0).toUpperCase()
    : "P";

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Header Gradient */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Pengaturan Akun
          </h1>
          <p className="text-sm text-base-content/60 mt-1.5 font-medium">
            Kelola preferensi dan keamanan akun sistem Anda
          </p>
        </div>

        <Notifikasi notif={notif} />

        {/* ── Profil ─────────────────────────────────────────────────── */}
        <div className="card bg-base-100/80 backdrop-blur-xl border border-base-200/60 shadow-xl shadow-base-200/40 rounded-2xl">
          <div className="card-body p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-base-200/60 pb-4 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User size={20} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-base-content">Informasi Akun</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Premium Avatar */}
              <div className="avatar placeholder relative group shrink-0 mx-auto sm:mx-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
                <div className="bg-gradient-to-br from-primary to-emerald-600 text-white rounded-full w-28 h-28 flex items-center justify-center ring-4 ring-base-100 relative shadow-lg">
                  <span className="text-5xl font-extrabold leading-none">{inisial}</span>
                </div>
              </div>

              {/* Field */}
              <div className="w-full space-y-4">
                <div className="form-control w-full">
                  <label className="label py-1.5">
                    <span className="label-text font-medium text-base-content/80">Nama Pengguna</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.data.nama_pengguna}
                    onChange={(e) => profileForm.setData("nama_pengguna", e.target.value)}
                    className={`input input-bordered w-full rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 ${
                      profileForm.errors?.nama_pengguna
                        ? "border-error focus:border-error focus:ring-error/20"
                        : "border-base-300 focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  {profileForm.errors?.nama_pengguna && (
                    <label className="label py-1">
                      <span className="label-text-alt text-error font-medium">
                        {profileForm.errors.nama_pengguna}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label py-1.5">
                    <span className="label-text font-medium text-base-content/80">Role Pengguna</span>
                  </label>
                  <div>
                    <span className="badge badge-primary badge-outline badge-lg gap-2 px-4 py-3 rounded-xl border-primary/30 bg-primary/5 font-semibold">
                      <Shield size={14} />
                      {auth?.user?.role || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-4 border-t border-base-200/60">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={profileForm.processing}
                className="btn text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-none shadow-lg shadow-emerald-500/30 rounded-xl px-8 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
              >
                {profileForm.processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Keamanan ───────────────────────────────────────────────── */}
        <div className="card bg-base-100/80 backdrop-blur-xl border border-base-200/60 shadow-xl shadow-base-200/40 rounded-2xl overflow-hidden">
          <div className="card-body p-0">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 border-b border-base-200/60 pb-4 mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Shield size={20} className="text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-base-content">Keamanan Akun</h2>
              </div>
            </div>

            <div className="px-4 pb-6 sm:px-6">
              <button
                type="button"
                onClick={openPasswordModal}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-base-200/50 active:bg-base-300/50 transition-colors group border border-transparent hover:border-base-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                    <Lock size={22} className="text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold text-base-content">Ubah Password</p>
                    <p className="text-sm text-base-content/60 mt-0.5">Tingkatkan keamanan dengan kata sandi baru</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-base-100 flex items-center justify-center shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  <ChevronRight size={20} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Informasi Sistem ───────────────────────────────────────── */}
        <div className="card bg-gradient-to-br from-base-100 to-base-200/50 border border-base-200/60 shadow-xl shadow-base-200/30 rounded-2xl">
          <div className="card-body p-6 sm:p-8">
            <h2 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-4">
              Informasi Sistem
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-base-100 p-4 rounded-xl border border-base-200/60 shadow-sm flex flex-col gap-1">
                <p className="text-xs text-base-content/50 font-medium">Nama Sistem</p>
                <p className="text-sm font-bold text-base-content">Sistem Informasi KUD Lubuk Karya</p>
              </div>
              <div className="bg-base-100 p-4 rounded-xl border border-base-200/60 shadow-sm flex flex-col gap-1">
                <p className="text-xs text-base-content/50 font-medium">Versi</p>
                <p className="text-sm font-bold text-base-content">v1.0.0 (Release)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Ubah Password ─────────────────────────────────────── */}
      <dialog ref={passwordModalRef} className="modal" onClose={resetPasswordForm}>
        <div className="modal-box relative bg-base-100/95 backdrop-blur-2xl border border-base-200/60 shadow-2xl rounded-3xl p-6 sm:p-8">
          <form method="dialog">
            <button
              type="submit"
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-base-content/50 hover:bg-base-200"
            >
              <X size={18} />
            </button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <Lock size={22} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl">Ubah Password</h3>
              <p className="text-xs text-base-content/60 font-medium mt-0.5">Pastikan gunakan kata sandi yang kuat</p>
            </div>
          </div>

          {passwordFormError && (
            <div role="alert" className="alert bg-rose-50 border-rose-200 text-rose-700 text-sm py-3 rounded-xl mb-5 flex items-start shadow-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="font-medium">{passwordFormError}</span>
            </div>
          )}

          <div className="space-y-3">
            <PasswordField
              label="Password Lama"
              placeholder="Masukkan password lama"
              value={password_lama}
              onChange={(e) => passwordForm.setData("password_lama", e.target.value)}
              visible={showPassword.lama}
              onToggle={() => toggleShowPassword("lama")}
              error={passwordForm.errors?.password_lama}
            />
            <div className="divider my-1"></div>
            <PasswordField
              label="Password Baru"
              placeholder="Masukkan password baru"
              value={password_baru}
              onChange={(e) => passwordForm.setData("password_baru", e.target.value)}
              visible={showPassword.baru}
              onToggle={() => toggleShowPassword("baru")}
              error={passwordBaruError || passwordForm.errors?.password_baru}
              hint="Minimal 8 karakter, berbeda dari password lama."
            />
            <PasswordField
              label="Konfirmasi Password Baru"
              placeholder="Ulangi password baru"
              value={konfirmasi_password}
              onChange={(e) => passwordForm.setData("konfirmasi_password", e.target.value)}
              visible={showPassword.konfirmasi}
              onToggle={() => toggleShowPassword("konfirmasi")}
              error={konfirmasiError || passwordForm.errors?.konfirmasi_password}
            />
          </div>

          <div className="modal-action mt-8 pt-4 border-t border-base-200/60 gap-3">
            <button
              type="button"
              onClick={closePasswordModal}
              className="btn btn-ghost rounded-xl font-medium"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSavePassword}
              disabled={passwordForm.processing}
              className="btn text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none shadow-lg shadow-amber-500/30 rounded-xl px-8 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-70"
            >
              {passwordForm.processing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan Password
                </>
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop bg-base-300/40 backdrop-blur-sm">
          <button type="submit">close</button>
        </form>
      </dialog>
    </MainLayout>
  );
}