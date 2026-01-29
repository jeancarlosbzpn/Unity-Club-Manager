import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Unity-Club-Manager/',
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: ['**/vite.config.mjs', '**/vite.config.js', '**/package.json', '**/.git/**']
    }
  }
});
