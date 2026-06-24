export default function ProgressRing({ pct = 75 }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg width="48" height="48" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="#E8F5E9"
          strokeWidth="4"
        />

        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="#1B8A3A"
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 22 22)"
        />
      </svg>

      <span className="absolute text-[9px] font-medium text-[#1B5E20]">
        {pct}%
      </span>
    </div>
  );
}