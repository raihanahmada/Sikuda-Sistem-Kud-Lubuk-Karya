import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "sikuda-theme";

const ThemeContext = createContext(null);

function getInitialTheme() {
    if (typeof window === "undefined") return "light";

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        // "kud" adalah tema DaisyUI terang default (lihat tailwind.config.js);
        // beberapa halaman (mis. Pengaturan) pakai class semantik DaisyUI
        // (bg-base-100 dst.) yang mengikuti data-theme, bukan class "dark".
        document.documentElement.setAttribute(
            "data-theme",
            theme === "dark" ? "dark" : "kud",
        );
        window.localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
