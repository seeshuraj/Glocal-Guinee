import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        },
        minify: 'terser'
    },
    server: {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN'
        }
    },
    optimizeDeps: {
        include: ['three', 'gsap', 'aos']
    }
});
