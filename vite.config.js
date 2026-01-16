import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        headers: {
            'Cache-Control': 'public, max-age=0, must-revalidate',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        }
    }
});
