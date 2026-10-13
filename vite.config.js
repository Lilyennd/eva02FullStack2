import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // ESTA ES LA SOLUCIÓN AL CHOQUE ESM vs CJS
    // Obliga a Vitest a procesar estas librerías juntas en el mismo formato
    server: {
      deps: {
        inline: [
          'react', 
          'react-dom', 
          'react-router', 
          'react-router-dom', 
          '@testing-library/react'
        ]
      }
    }
  },
  server: {
    proxy: {
      '/img': {
        target: 'https://eva01-full-stack2-eight.vercel.app',
        changeOrigin: true,
      },
    },
  },
});