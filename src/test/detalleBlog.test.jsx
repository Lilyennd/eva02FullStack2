import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import DetalleBlog from '../views/detalleBlog'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const blog = {
  id_blog: 3,
  titulo: 'Historia del rubí',
  descripcion_corta: 'Resumen del artículo',
  descripcion_larga: '<p>Contenido completo del artículo</p>',
  fecha_publicacion: '2026-03-15T12:00:00',
  imagen: 'rubi.jpg',
}

describe('Vista Detalle de Blog (Cliente)', () => {
  it('debe pedir el blog según el id de la URL y mostrar su contenido', async () => {
    apiFetch.mockResolvedValue(respuesta(blog))

    renderConRuta(<DetalleBlog />, '/detalleBlog?id=3', '/detalleBlog')

    expect(await screen.findByRole('heading', { level: 1, name: 'Historia del rubí' })).toBeInTheDocument()
    expect(screen.getByText('Resumen del artículo')).toBeInTheDocument()
    expect(screen.getByText('Contenido completo del artículo')).toBeInTheDocument()
    expect(screen.getByText(/Publicado el .*2026/)).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/blogs/3')
    expect(screen.getByRole('link', { name: /Volver a Blogs/ })).toHaveAttribute('href', '/blogs')
  })
})
