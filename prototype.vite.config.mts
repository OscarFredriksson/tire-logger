import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: resolve('src/renderer'),
  cacheDir: resolve('node_modules/.vite-prototype'),
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    open: '/prototype.html#/cars?variant=A'
  },
  build: {
    outDir: resolve('dist/prototype'),
    rollupOptions: { input: resolve('src/renderer/prototype.html') }
  }
});
