import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTOPLAY_MS = 5000;

export default function FotoSlider({ foto = [], className = '' }) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef(null);

    const goTo = useCallback((i) => {
        setIndex((i + foto.length) % foto.length);
    }, [foto.length]);

    const next = useCallback(() => goTo(index + 1), [goTo, index]);
    const prev = useCallback(() => goTo(index - 1), [goTo, index]);

    useEffect(() => {
        if (foto.length <= 1) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % foto.length);
        }, AUTOPLAY_MS);
        return () => clearInterval(timerRef.current);
    }, [foto.length]);

    if (foto.length === 0) return null;

    return (
        <div className={`group relative overflow-hidden ${className}`}>
            {foto.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
                        i === index ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}

            {/* Overlay gradasi biar kartu label & teks tetap enak dibaca */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B3B1E]/70 via-transparent to-[#0B3B1E]/10" />

            {foto.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={prev}
                        aria-label="Foto sebelumnya"
                        className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition hover:bg-white/25 group-hover:opacity-100"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        aria-label="Foto berikutnya"
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition hover:bg-white/25 group-hover:opacity-100"
                    >
                        <ChevronRight size={16} />
                    </button>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {foto.map((src, i) => (
                            <button
                                key={src}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Ke foto ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all ${
                                    i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
