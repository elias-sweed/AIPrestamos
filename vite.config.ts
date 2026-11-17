import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // No cachear respuestas de Supabase (respeta auth, RLS y privacidad).
        // Solo NetworkOnly para API y Storage de Supabase.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[^.]+\.supabase\.co\/rest\/v1\//,
            handler: 'NetworkOnly',
            method: 'GET',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 },
            },
          },
          {
            urlPattern: /^https:\/\/[^.]+\.supabase\.co\/storage\/v1\//,
            handler: 'NetworkOnly',
            method: 'GET',
            options: {
              cacheName: 'supabase-storage',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/**/*', 'manifest.json'],
      manifest: {
        name: 'AIP Gest',
        short_name: 'AIP Gest',
        description: 'Control de Préstamos de Equipos AIP',
        theme_color: '#1565C0',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    open: true,
  },
})
