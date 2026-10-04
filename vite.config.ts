import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import path from 'node:path'
import manifest from './manifest.config.ts'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), crx({ manifest }), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  build: {
    rollupOptions: { input: { index: 'index.html', blocked: 'blocked.html' } },
  },
})
