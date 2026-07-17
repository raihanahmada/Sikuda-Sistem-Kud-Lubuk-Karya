// Motif daun abstrak — dipakai sebagai pengganti foto, biar terasa custom & organik
// alih-alih foto stok yang kaku.
export default function DaunAbstrak({ className }) {
    return (
        <svg viewBox="0 0 200 200" fill="none" className={className}>
            <path
                d="M100 10C40 30 15 90 30 150C45 190 90 195 130 175C175 152 190 90 165 45C150 18 125 5 100 10Z"
                fill="currentColor"
            />
            <path
                d="M100 20C105 70 110 120 135 165"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}
