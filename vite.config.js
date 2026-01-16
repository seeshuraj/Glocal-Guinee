import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['vite']
                }
            }
        }
    },
    server: {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
    },
    preview: {
        port: 3000
    }
});
