import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  build: {
    // Aumenta el límite de advertencia para chunks grandes (opcional)
    chunkSizeWarningLimit: 1000,
  },
  
  server: {
    port: 5173,
    open: true
  }
});