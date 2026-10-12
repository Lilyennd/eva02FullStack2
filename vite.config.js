import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // Las APIs se llaman directo al backend de Vercel (src/services/api.js).
    // Solo las imágenes (/img/...) viven en el backend, así que se piden allá.
    proxy: {
      '/img': {
        target: 'https://eva01-full-stack2-eight.vercel.app',
        changeOrigin: true,
      },
    },
  },
})

