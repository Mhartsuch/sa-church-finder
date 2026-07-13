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
        // Function form (not object form) so chunks are only created for modules
        // actually reachable from each entry point. Object form forces every
        // listed chunk (e.g. map-vendor) into the eager modulepreload set even
        // when it is only imported by lazy-loaded components.
        manualChunks(id) {
          // Vite's dynamic-import preload helper is shared by every lazy chunk.
          // Pin it to react-vendor (which everything already imports) so Rollup
          // doesn't hoist it into an otherwise-lazy chunk like map-vendor and
          // drag that chunk into the eager graph.
          if (id.includes('vite/preload-helper')) return 'react-vendor'
          // 'mapbox-gl' is aliased to src/lib/mapbox-gl-runtime.ts, so match it
          // by path rather than node_modules.
          if (id.includes('node_modules/react-map-gl') || id.includes('mapbox-gl-runtime')) {
            return 'map-vendor'
          }
          if (!id.includes('node_modules')) return
          if (id.includes('@sentry')) return 'sentry-vendor'
          if (id.includes('@tanstack')) return 'query-vendor'
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('react-router') ||
            id.includes('@remix-run/router')
          ) {
            return 'react-vendor'
          }
          if (
            id.includes('lucide-react') ||
            id.includes('embla-carousel') ||
            id.includes('class-variance-authority') ||
            id.includes('node_modules/clsx/') ||
            id.includes('tailwind-merge')
          ) {
            return 'ui-vendor'
          }
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
