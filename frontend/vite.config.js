import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // taake localhost + alshifa.localhost dono pe dev server chale
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: false, // host header preserve rahe (multi-tenant ke liye better)
      },
    },
  },
});
