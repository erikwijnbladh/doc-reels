import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['remotion', '@remotion/player'],
  },
  server: {
    port: 5173,
  },
})
