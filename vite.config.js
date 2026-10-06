import { defineConfig } from 'vite';
export default defineConfig({
  base: '/sion-portfolio/',
  build: { target: 'es2022', chunkSizeWarningLimit: 600 }
});
