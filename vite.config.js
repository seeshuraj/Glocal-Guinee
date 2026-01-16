import { defineConfig } from 'vite';

export default defineConfig({
    esbuild: {
        drop: ['console', 'debugger'],
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild'
    },
    server: {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        }
    },
    optimizeDeps: {
        include: ['three', 'gsap', 'aos']
    }
});
