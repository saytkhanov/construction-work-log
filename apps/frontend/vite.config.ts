import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// В dev-режиме проксируем /api на backend, чтобы фронт ходил по относительным
// путям и не упирался в CORS. В docker-сборке проксированием занимается nginx.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
