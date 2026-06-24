import { Link, usePage } from '@inertiajs/react';

export default function AdminAnggotaLayout({
    children,
    title = 'Dashboard',
}) {
    const { url } = usePage();

    const menus = [
        {
            name: 'Dashboard',
            href: '/admin-anggota/dashboard',
            icon: '🎛️',
        },
        {
            name: 'Pendaftaran Anggota',
            href: '/admin-anggota/pendaftaran-anggota',
            icon: '📝',
        },
        {
            name: 'Antrian Verifikasi',
            href: '/admin-anggota/verifikasi',
            icon: '📄',
        },
        {
            name: 'Data Anggota',
            href: '/admin-anggota/data-anggota',
            icon: '👥',
        },
        {
            name: 'Simpanan Anggota',
            href: '/admin-anggota/simpanan',
            icon: '💰',
        },
        {
            name: 'Tracking Aktivitas',
            href: '/admin-anggota/tracking',
            icon: '📊',
        },
        {
            name: 'Pengaturan',
            href: '/admin-anggota/pengaturan',
            icon: '⚙️',
        },
    ];

    return (
        <div className="min-h-screen flex bg-[#f5f6fa]">

            {/* SIDEBAR */}
            <aside className="w-72 bg-white border-r flex flex-col">

                {/* Logo */}
                <div className="p-6 border-b">

                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold">
                            ☁
                        </div>

                        <div>
                            <h1 className="font-bold text-gray-800">
                                KUD Lubuk Karya
                            </h1>

                            <p className="text-xs text-gray-500 uppercase">
                                Admin Anggota
                            </p>
                        </div>

                    </div>

                </div>

                {/* MENU */}
                <div className="flex-1 px-4 py-6 space-y-2">

                    {menus.map((menu) => {

                        const active = url.startsWith(menu.href);

                        return (
                            <Link
                                key={menu.name}
                                href={menu.href}

                                // ===== DAISYUI BUTTON MENU =====
                                className={`
                                    btn
                                    btn-soft
                                    w-full
                                    justify-start
                                    gap-3
                                    ${
                                        active
                                            ? 'btn-success'
                                            : ''
                                    }
                                `}
                            >
                                <span>{menu.icon}</span>

                                <span>{menu.name}</span>
                            </Link>
                        );
                    })}

                </div>

                {/* LOGOUT */}
                <div className="p-4 border-t">

                    <Link
                        href="/sikuda/logout"
                        method="post"
                        as="button"

                        // ===== DAISYUI BUTTON LOGOUT =====
                        className="btn btn-soft btn-error w-full"
                    >
                        Logout
                    </Link>

                </div>

            </aside>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col">

                {/* TOPBAR */}
                <header className="bg-white border-b px-8 py-4">

                    <div className="flex items-center justify-between">

                        {/* LEFT */}
                        <div className="flex items-center gap-6">

                            <h1 className="text-3xl font-bold text-gray-800">
                                {title}
                            </h1>

                            <div className="hidden lg:block">

                                <input
                                    type="text"
                                    placeholder="Cari data anggota koperasi..."
                                    className="
                                        w-80
                                        bg-gray-100
                                        rounded-xl
                                        px-4 py-3
                                        outline-none
                                    "
                                />

                            </div>

                        </div>

                        {/* RIGHT */}
                        <div className="flex items-center gap-4">

                            <button className="w-10 h-10 rounded-xl bg-gray-100">
                                📩
                            </button>

                            <button className="w-10 h-10 rounded-xl bg-gray-100">
                                🔔
                            </button>

                            <div className="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                                A
                            </div>

                        </div>

                    </div>

                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-8">

                    {children}

                </main>

            </div>

        </div>
    );
}