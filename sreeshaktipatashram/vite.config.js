import { defineConfig, searchForWorkspaceRoot } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react-core';
          }

          if (id.includes('react-router')) {
            return 'router';
          }

          if (id.includes('firebase')) {
            return 'firebase';
          }

          if (id.includes('framer-motion')) {
            return 'motion';
          }

          if (
            id.includes('@uiw/react-md-editor') ||
            id.includes('react-markdown') ||
            id.includes('remark-gfm')
          ) {
            return 'editor';
          }

          if (id.includes('country-state-city')) {
            return 'country';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd())
      ]
    }
  }
})
