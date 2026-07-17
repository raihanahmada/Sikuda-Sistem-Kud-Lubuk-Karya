// ===== PENERAPAN MATERI: Reusable Component (Pertemuan 3) =====
// InputField adalah komponen reusable, menerima props label, type, value, onChange, placeholder
// Tujuannya: hindari penulisan <label> + <input> berulang di setiap form
export default function InputField({ label, type = "text", value, onChange, placeholder, error }) {
    return (
        <div>
            <label className="block text-base font-medium text-gray-600 mb-1.5">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-[#1B8A3A]/20 focus:border-[#1B8A3A]"
                value={value}
                onChange={onChange}
            />
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
    );
}
// ===== AKHIR REUSABLE COMPONENT =====