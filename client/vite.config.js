import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'logo.png'],
            manifest: {
                name: 'WoolMonitor Enterprise',
                short_name: 'WoolMonitor',
                description: 'Enterprise wool supply chain management platform',
                theme_color: '#059669',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
                ],
            },
        }),
    ],
    server: {
        port: 5173,
        proxy: {
                '/api': { target: 'http://localhost:5001', changeOrigin: true },
                '/uploads': { target: 'http://localhost:5001', changeOrigin: true },
            },
    },
})
