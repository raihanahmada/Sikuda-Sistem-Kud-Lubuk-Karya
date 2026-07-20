import { X } from 'lucide-react';

// Kerangka popup modern yang dipakai bersama oleh semua modal di role Admin Anggota
// (header gradasi hijau khas role ini + ikon badge, kartu putih rounded, overlay gelap+blur).
export default function ModalShell({ title, subtitle, icon: Icon, onTutup, maxWidth = 'max-w-xl', children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            <div className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10`}>
                <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-2xl bg-gradient-to-br from-[#22A94F] via-[#1B8A3A] to-[#0F5C26] px-6 py-5 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                        {Icon && (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                                <Icon size={20} className="text-white" />
                            </span>
                        )}
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-white leading-tight truncate">{title}</h2>
                            {subtitle && <p className="text-sm text-emerald-50/80 mt-0.5 truncate">{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onTutup}
                        className="shrink-0 rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 bg-gradient-to-b from-emerald-50/50 to-white dark:from-gray-900 dark:to-gray-900">{children}</div>
            </div>
        </div>
    );
}
