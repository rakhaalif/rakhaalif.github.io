import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    assetsDir: '_app', // keeps the app bundle out of /assets/, which holds the kit
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), credits: resolve(import.meta.dirname, 'credits.html') },
    },
  },
});
