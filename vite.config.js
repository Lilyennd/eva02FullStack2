import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',

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
    // OneDrive no avisa bien de los cambios: Vite revisa los archivos cada 300 ms
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});