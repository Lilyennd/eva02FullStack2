import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.js',
  include: ['src/test/**/*.test.{js,jsx}'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    include: [
      'src/services/api.js',
      'src/views/home.jsx',
      'src/views/nosotros.jsx',
      'src/views/Footer.jsx',
      'src/views/Navbar.jsx',
      'src/views/Carrito.jsx',
      'src/views/blogs.jsx',
      'src/views/detalleBlog.jsx',
      'src/views/contacto.jsx',
      'src/views/productos.jsx',
      'src/views/detalleProducto.jsx',
      'src/views/categorias.jsx',
      'src/views/ofertas.jsx',
      'src/views/login.jsx',
      'src/views/registroUsuario.jsx',
      'src/views/checkout.jsx',
      'src/views/pagoCorrecto.jsx',
      'src/views/pagoError.jsx',
      'src/views/DatosCompra.jsx',
    ],
  },
  },
  server: {
    proxy: {
      '/img': {
        target: 'https://eva01-full-stack2-eight.vercel.app',
        changeOrigin: true,
      },
    },
  },
})

