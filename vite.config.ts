import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  base: '/hf-reverse-mortgage-guide/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
