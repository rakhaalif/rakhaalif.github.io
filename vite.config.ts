import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  // the hero's release panel prints when the page was built; release.mjs publishes only builds whose checks all passed.
  // shortcut: vite build and the prerender each read the clock, so a build across midnight (Jakarta) differs by a day for one frame
  define: { __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' })) },
  build: {
    assetsDir: '_app', // keeps the app bundle out of /assets/, which holds the kit
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), credits: resolve(import.meta.dirname, 'credits.html') },
    },
  },
});
