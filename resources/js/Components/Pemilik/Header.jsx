import { useEffect, useState } from "react";
import { Calendar, Menu } from "lucide-react";

const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

function getFormattedDate() {
  const now = new Date();
  return `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

export default function Header({ isOpen, setIsOpen }) {
  const [date, setDate] = useState(getFormattedDate);

  useEffect(() => {
    const timer = setInterval(() => setDate(getFormattedDate()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className={`
        fixed top-0 right-0 z-30 h-[60px]
        bg-white border-b border-gray-100
        flex items-center justify-between px-5
        transition-all duration-300 ease-in-out
        ${isOpen ? "left-56" : "left-0"}
      `}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu size={15} />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1B5E20] shrink-0" />
          <h2 className="text-sm font-medium text-gray-900 tracking-tight whitespace-nowrap">
            Ringkasan Strategis Koperasi
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-400">
          <Calendar size={13} />
          <span className="font-medium text-gray-800">{date}</span>
        </div>

        <div className="w-px h-5 bg-gray-100 mx-1" />

        <button className="w-8 h-8 rounded-full bg-[#1B5E20] flex items-center justify-center text-white text-[11px] font-medium tracking-wide">
          K
        </button>
      </div>
    </header>
  );
}