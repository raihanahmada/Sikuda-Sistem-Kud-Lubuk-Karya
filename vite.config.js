import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    optimizeDeps: {
        // recharts (dan dependency d3-nya) dipakai lewat React.lazy di GrafikArusKas.
        // Tanpa ini, Vite baru meng-optimize-nya saat komponen pertama kali diakses,
        // sehingga delay pre-bundling terasa di navigasi user, bukan di start dev server.
        include: ['recharts'],
    },
});
