import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Blogs from '../views/blogs'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const blogs = [
  { id_blog: 1, titulo: 'Cómo elegir un diamante', descripcion_corta: 'Las 4 Cs explicadas', imagen: 'blog1.jpg' },
  { id_blog: 2, titulo: 'Cuidado de gemas', descripcion_corta: 'Consejos de limpieza', imagen: null },
]

describe('Vista Blogs (Cliente)', () => {
  it('debe cargar los blogs desde el backend y enlazar cada uno a su detalle', async () => {
    apiFetch.mockResolvedValue(respuesta(blogs))

    renderConRuta(<Blogs />, '/blogs')

    expect(screen.getByText('Cargando blogs...')).toBeInTheDocument()
    expect(await screen.findByText('Cómo elegir un diamante')).toBeInTheDocument()
    expect(screen.getByText('Cuidado de gemas')).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/blogs')

    const enlaces = screen.getAllByRole('link', { name: 'Detalles' })
    expect(enlaces[0]).toHaveAttribute('href', '/detalleBlog?id=1')
    expect(enlaces[1]).toHaveAttribute('href', '/detalleBlog?id=2')
  })
})
