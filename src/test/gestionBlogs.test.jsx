import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GestionBlogs from '../views/gestionBlogs'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ urlImagen: (img) => img,
  apiFetch: vi.fn(),
  API_URL: 'http://localhost:8080',
}))

const blogsMock = [
  { id_blog: 1, titulo: 'Cómo elegir un diamante', descripcion_corta: 'Guía de las 4 Cs', imagen: 'blog1.jpg' },
  { id_blog: 2, titulo: 'Limpieza de joyas', descripcion_corta: 'Cuidados básicos', imagen: null },
]

describe('Vista Gestión de Blogs (Admin)', () => {
  it('lista los blogs, enlaza a crear/modificar y permite eliminar un blog', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    apiFetch.mockImplementation((url, opciones) => {
      if (opciones?.method === 'DELETE') return Promise.resolve(respuesta({}))
      return Promise.resolve(respuesta(blogsMock))
    })

    renderConRuta(<GestionBlogs />, '/gestionBlogs', '/gestionBlogs')

    expect(await screen.findByText('Cómo elegir un diamante')).toBeInTheDocument()
    expect(screen.getByText('Limpieza de joyas')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Agregar Nuevo Blog' })).toHaveAttribute('href', '/nuevoBlog')

    const linksModificar = screen.getAllByRole('link', { name: 'Modificar' })
    expect(linksModificar[0]).toHaveAttribute('href', '/modificarBlog?id=1')
    expect(linksModificar[1]).toHaveAttribute('href', '/modificarBlog?id=2')

    const botonesEliminar = screen.getAllByRole('button', { name: 'Eliminar' })
    await user.click(botonesEliminar[0])

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith('/api/blogs/1', { method: 'DELETE' }),
    )
    expect(alerta).toHaveBeenCalledWith('Blog eliminado correctamente.')
  })

  it('muestra mensaje cuando no hay blogs publicados', async () => {
    apiFetch.mockResolvedValue(respuesta([]))

    renderConRuta(<GestionBlogs />, '/gestionBlogs', '/gestionBlogs')

    expect(await screen.findByText('No hay blogs publicados actualmente.')).toBeInTheDocument()
  })
})