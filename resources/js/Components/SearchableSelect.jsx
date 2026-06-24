import { useState, useRef, useEffect, useMemo } from 'react';

export default function SearchableSelect({
    options,            // [{ value, label }]
    value,              // value terpilih
    onChange,           // (value) => void
    placeholder = '— Pilih —',
    error = false,
}) {
    const [buka, setBuka] = useState(false);
    const [cari, setCari] = useState('');
    const wrapRef = useRef(null);

    // Tutup saat klik di luar (DOM listener — bukan fetch data)
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setBuka(false);
                setCari('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const terpilih = options.find((o) => String(o.value) === String(value));

    const hasil = useMemo(() => {
        const q = cari.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [cari, options]);

    const pilih = (val) => {
        onChange(val);
        setBuka(false);
        setCari('');
    };

    return (
        <div className="relative" ref={wrapRef}>
            {/* Tombol pemicu */}
            <button type="button" onClick={() => setBuka((v) => !v)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-green-600 ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                }`}>
                <span className={terpilih ? 'text-gray-900' : 'text-gray-400'}>
                    {terpilih ? terpilih.label : placeholder}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition ${buka ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Panel dropdown */}
            {buka && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    {/* Kotak pencarian */}
                    <div className="border-b border-gray-100 p-2">
                        <input type="text" autoFocus value={cari}
                            onChange={(e) => setCari(e.target.value)}
                            placeholder="Ketik untuk mencari…"
                            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-600" />
                    </div>

                    {/* Daftar opsi (filtered) */}
                    <ul className="max-h-56 overflow-y-auto py-1">
                        {hasil.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</li>
                        ) : (
                            hasil.map((o) => (
                                <li key={o.value}>
                                    <button type="button" onClick={() => pilih(o.value)}
                                        className={`block w-full px-3 py-2 text-left text-sm hover:bg-green-50 ${
                                            String(o.value) === String(value)
                                                ? 'bg-green-50 font-medium text-green-700'
                                                : 'text-gray-700'
                                        }`}>
                                        {o.label}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
