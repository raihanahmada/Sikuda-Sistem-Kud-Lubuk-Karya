// ===== PENERAPAN MATERI: Reusable Component (Pertemuan 3) =====
// InputField adalah komponen reusable, menerima props label, type, value, onChange, placeholder
// Tujuannya: hindari penulisan <label> + <input> berulang di setiap form
export default function InputField({ label, type = "text", value, onChange, placeholder, error }) {
    return (
        <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full p-2 border border-gray-300 rounded"
                value={value}
                onChange={onChange}
            />
            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
    );
}
// ===== AKHIR REUSABLE COMPONENT =====