import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/Context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Ubah ke tema terang" : "Ubah ke tema gelap"}
            title={isDark ? "Tema terang" : "Tema gelap"}
            className={
                `w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors ${className}`
            }
        >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
    );
}
