import { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { 
    LayoutDashboard, UserPlus, ShieldCheck, Users, 
    PiggyBank, Activity, Settings, LogOut, X, AlertTriangle, Menu, Calendar
} from "lucide-react";
import { useEffect } from "react";

const menuItems = [
    { name: 'Dashboard',           icon: LayoutDashboard, href: '/admin-anggota/dashboard' },
    { name: 'Pendaftaran Anggota', icon: UserPlus,         href: '/admin-anggota/pendaftaran-anggota' },
    { name: 'Verifikasi Anggota',  icon: ShieldCheck,      href: '/admin-anggota/verifikasi' },
    { name: 'Data Anggota',        icon: Users,            href: '/admin-anggota/data-anggota' },
    { name: 'Simpanan Anggota',    icon: PiggyBank,        href: '/admin-anggota/simpanan' },
    { name: 'Pelacakan Aktivitas', icon: Activity,         href: '/admin-anggota/tracking' },
    { name: 'Pengaturan',          icon: Settings,         href: '/admin-anggota/pengaturan' },
];

const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];

function getFormattedDate() {
    const now = new Date();
    return `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

export default function AdminAnggotaLayout({ children, title = 'Dashboard' }) {
    const { url } = usePage();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [date, setDate] = useState(getFormattedDate);

    useEffect(() => {
        const timer = setInterval(() => setDate(getFormattedDate()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleConfirmLogout = () => {
        router.post(route('sikuda.logout'));
    };

    return (
        <div className="min-h-screen bg-[#F2F4F3]">

            {/* OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
                fixed top-0 left-0 h-full z-50 w-56 bg-white border-r border-gray-100
                flex flex-col justify-between p-4
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <X size={16} className="text-gray-400" />
                </button>

                {/* Logo */}
                <div>
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                        <div className="w-9 h-9 rounded-full bg-[#1B8A3A] flex items-center justify-center text-white font-bold text-sm">
                            K
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[#1B5E20]">KUD Lubuk Karya</p>
                            <p className="text-[10px] text-gray-400">Admin Anggota</p>
                        </div>
                    </div>

                    {/* Menu */}
                    <ul className="space-y-1">
                        {menuItems.map(({ name, icon: Icon, href }) => {
                            const isActive = href === '/admin-anggota/dashboard'
                                ? url === href
                                : url.startsWith(href);
                            return (
                                <li key={name}>
                                    <Link
                                        href={href}
                                        onClick={() => setIsOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                                            ${isActive
                                                ? "bg-[#E8F5E9] text-[#1B5E20] font-semibold"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-[#1B8A3A]"}
                                        `}
                                    >
                                        <Icon size={17} />
                                        <span>{name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Bottom — User & Logout */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] font-semibold text-sm">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Admin Anggota</p>
                            <p className="text-[10px] text-gray-400">Pengelola Keanggotaan</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-b from-[#E24B4A] to-[#A32D2D] shadow-md shadow-red-900/30 hover:from-[#D43F3E] hover:to-[#8F2727] active:scale-[0.98] transition-all duration-200"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* HEADER */}
            <header className={`
                fixed top-0 right-0 z-30 h-[60px]
                bg-white border-b border-gray-100
                flex items-center justify-between px-5
                transition-all duration-300 ease-in-out
                ${isOpen ? "left-56" : "left-0"}
            `}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                        <Menu size={15} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20] shrink-0" />
                        <h2 className="text-sm font-medium text-gray-900 tracking-tight whitespace-nowrap">
                            {title}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-400">
                        <Calendar size={13} />
                        <span className="font-medium text-gray-800">{date}</span>
                    </div>
                    <div className="w-px h-5 bg-gray-100 mx-1" />
                    <div className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center text-white text-[11px] font-medium">
                        A
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className={`
                pt-[60px] min-h-screen
                transition-all duration-300 ease-in-out
                ${isOpen ? "ml-56" : "ml-0"}
            `}>
                <div className="p-6 space-y-4">
                    {children}
                </div>
            </main>

            {/* MODAL LOGOUT */}
            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <AlertTriangle size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                Yakin mau keluar?
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Anda akan keluar dari sesi ini dan perlu login kembali untuk mengakses sistem.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-[#E24B4A] to-[#A32D2D] shadow-md shadow-red-900/30 hover:from-[#D43F3E] hover:to-[#8F2727] active:scale-[0.98] transition-all"
                            >
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}