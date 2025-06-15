// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ✅ allow access from any device in the network
    port: 5173,
    strictPort: true
  }
});
