import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'  // ✅ Import path module

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // ✅ Now works
    }
  }
})