import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { speakManifestPlugin } from './scripts/vite-plugin-speak-manifest.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    speakManifestPlugin(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'fonts/*.woff2'],
      manifest: {
        name: 'Hiszpański Quiz',
        short_name: 'Quiz ES',
        description: 'Szybkie ćwiczenie odmiany czasowników i zaimków hiszpańskich',
        lang: 'pl',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Celowo bez 'json': public/speak/manifest.json musi zawsze iść na żywo przez sieć
        // (fetch z cache: 'no-store' w useListeningSession) — precache serwowałby stare dane.
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,woff2}'],
      },
    }),
  ],
})
