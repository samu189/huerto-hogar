import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La app React usa app.html para no pisar el index.html de la EP1 (sitio HTML estático).
export default defineConfig({
  plugins: [react()],
  server: { open: '/app.html' },
  build: { rollupOptions: { input: 'app.html' } }
});
