import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = '/Workout-Tracker/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Workouts',
        short_name: 'Workouts',
        description: 'A simple offline workout tracker.',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#15171a',
        theme_color: '#15171a',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // woff2 only: every browser this PWA targets (modern iOS/Android)
        // fetches woff2, so caching the legacy .woff fallback too would
        // just double the precached font payload for nothing.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
})
