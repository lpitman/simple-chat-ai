import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
  ],
  server: {
    host: 'logan-linux.tailnet.internal',
    allowedHosts: ['logan-linux.tailnet.internal'],
    port: 5173
  }
})
