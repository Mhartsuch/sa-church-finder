import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'mapbox-gl': path.resolve(__dirname, './src/lib/mapbox-gl-runtime.ts'),
    },
  },
  build: {
    // Split large third-party deps into their own chunks so they can be cached
    // independently of app code and so the initial HTML only downloads what the
    // first route actually needs.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-virtual'],
          'map-vendor': ['react-map-gl', 'mapbox-gl'],
          'sentry-vendor': ['@sentry/react'],
          'ui-vendor': [
            'lucide-react',
            'embla-carousel-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
        },
      },
    },
    // Raise the warning threshold a touch — our largest chunk (map-vendor) is
    // intentionally heavy but lazy-loaded by the map UI.
    chunkSizeWarningLimit: 600,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
