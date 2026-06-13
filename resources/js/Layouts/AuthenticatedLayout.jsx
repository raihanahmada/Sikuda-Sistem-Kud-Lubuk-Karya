import { Head } from '@inertiajs/react';
import ladangImg from '../../assets/Ladang.jpg';

export default function AuthenticatedLayout({ title, children, status }) {
    return (
        <>
            <Head title={title} />

            <div className="flex min-h-screen">

                {/* ── Kolom Kiri: Form Login ── */}
                <div className="flex w-full flex-col justify-center px-10 md:w-1/2 lg:px-20">
                    <div className="mx-auto w-full max-w-sm">

                        {/* Status session (misal setelah logout) */}
                        {status && (
                            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        {/* Children Form Content */}
                        {children}
                    </div>
                </div>

                {/* ── Kolom Kanan: Hero / Branding ── */}
                <div className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-gray-900 md:flex">

                    {/* Label kantor di pojok kiri atas */}
                    <div className="absolute left-5 top-5 z-10">
                        <span className="rounded-sm bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                            Kantor KUD Lubuk Karya
                        </span>
                    </div>

                    {/* Background gambar sawit */}
                    <img
                        src={ladangImg}
                        alt="Kebun sawit KUD Lubuk Karya"
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />

                    {/* Overlay gradient bawah */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Teks branding */}
                    <div className="relative z-10 px-10 pb-14">
                        <h2 className="mb-3 text-3xl font-bold leading-snug text-white">
                            Kelola pekerjaan
                            <br />
                            anda menjadi lebih
                            <br />
                            mudah
                        </h2>
                        <p className="text-sm text-white/70">
                            Selamat datang kembali! Masuk untuk mengakses
                            <br />
                            dasbor admin dan laporan harian Anda.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
