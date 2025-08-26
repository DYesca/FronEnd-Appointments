/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@ionic/vue', '@ionic/vue-router', 'ionicons/icons'],
    exclude: ['@ionic/pwa-elements']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ionic-core': ['@ionic/vue', '@ionic/vue-router'],
          'icons': ['ionicons/icons']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
