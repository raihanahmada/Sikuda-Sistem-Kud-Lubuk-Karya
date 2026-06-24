import { Link, usePage, router } from "@inertiajs/react";
import { Home, FileText, Users, Settings, LogOut, X } from "lucide-react";

const menuItems = [
  { name: "Dasbor Utama",     icon: Home,     href: "/pemilik/dashboard" },
  { name: "Laporan Periodik", icon: FileText, href: "/pemilik/laporan-periodik" },
  // { name: "Analisis Anggota", icon: Users,    href: "/pemilik/analisis-anggota" },
  { name: "Pengaturan",       icon: Settings, href: "/pemilik/pengaturan" },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { url } = usePage();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-56 bg-white border-r border-gray-100
          flex flex-col justify-between p-4
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Tutup menu"
        >
          <X size={16} className="text-gray-400" />
        </button>

        <div>
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-[#1B8A3A] flex items-center justify-center text-white font-bold text-sm">
              K
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B5E20]">KUD Lubuk Karya</p>
              <p className="text-[10px] text-gray-400">Dasbor Pemantauan</p>
            </div>
          </div>

          <ul className="space-y-1">
            {menuItems.map(({ name, icon: Icon, href }) => {
              const isActive = url === href;
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

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1B5E20] font-semibold text-sm">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Pimpinan KUD</p>
              <p className="text-[10px] text-gray-400">Owner / Administrator</p>
            </div>
          </div>
          <button
           onClick={() => router.post(route("sikuda.logout"))}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}