import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Blogs from '../views/blogs'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

// apiFetch es un mock, pero por defecto llama al apiFetch real
vi.mock('../services/api', async () => {
  const real = await vi.importActual('../services/api')
  return { ...real, urlImagen: (img) => img, apiFetch: vi.fn(real.apiFetch) }
})

const blogs = [
  { id_blog: 1, titulo: 'Cómo elegir un diamante', descripcion_corta: 'Las 4 Cs explicadas', imagen: 'blog1.jpg' },
  { id_blog: 2, titulo: 'Cuidado de gemas', descripcion_corta: 'Consejos de limpieza', imagen: null },
]

describe('Vista Blogs (Cliente)', () => {
  it('debe cargar los blogs desde el backend y enlazar cada uno a su detalle', async () => {
    // Solo en este test usamos datos falsos
    apiFetch.mockResolvedValueOnce(respuesta(blogs))

    renderConRuta(<Blogs />, '/blogs')

    expect(screen.getByText('Cargando blogs...')).toBeInTheDocument()
    expect(await screen.findByText('Cómo elegir un diamante')).toBeInTheDocument()
    expect(screen.getByText('Cuidado de gemas')).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/blogs')

    const enlaces = screen.getAllByRole('link', { name: 'Detalles' })
    expect(enlaces[0]).toHaveAttribute('href', '/blog/1')
    expect(enlaces[1]).toHaveAttribute('href', '/blog/2')
  })

  it('debe traer los blogs reales del backend y mostrar el blog inicial', async () => {
    // Sin mockResolvedValue: usa el apiFetch real
    renderConRuta(<Blogs />, '/blogs')

    expect(screen.getByText('Cargando blogs...')).toBeInTheDocument()

    // Blog real que devuelve tu backend
    expect(
      await screen.findByText(
        'De las minas al brillo: el origen de los diamantes',
        {},
        { timeout: 8000 }
      )
    ).toBeInTheDocument()

    const enlaces = screen.getAllByRole('link', { name: 'Detalles' })
    expect(enlaces[0]).toHaveAttribute('href', '/blog/1')
  }, 15000)
})