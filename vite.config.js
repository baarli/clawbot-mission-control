import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Set this to your GitHub repository name for GitHub Pages
// e.g., if your repo is https://github.com/username/clawbot-mission-control
// set base: '/clawbot-mission-control/'
const REPO_NAME = process.env.VITE_REPO_NAME || 'clawbot-mission-control'

export default defineConfig({
  plugins: [react()],
  base: './',  // Use relative paths for docs folder deployment
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          dnd: ['@hello-pangea/dnd'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
