import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'logan-linux.tailnet.internal',
    allowedHosts: ['logan-linux.tailnet.internal'],
    port: 5173
  }
})
