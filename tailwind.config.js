import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
        "./resources/js/**/*.js",
    ],

    darkMode: "class",

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },
        },
    },

plugins: [forms, daisyui],
daisyui: {
    themes: [
        {
            kud: {
                primary: "#1B8A3A",
                "primary-content": "#ffffff",
                secondary: "#3B82F6",
                accent: "#22C55E",
                neutral: "#374151",
                "base-100": "#ffffff",
            },
        },
        "light",
        "dark",
    ],
},
}
