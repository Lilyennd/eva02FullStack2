import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModificarBlog from '../views/modificarBlog'
import { apiFetch, blogsApi, subirImagen } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ urlImagen: (img) => img,
  apiFetch: vi.fn(),
  blogsApi: { actualizar: vi.fn() },
  subirImagen: vi.fn(),
}))

const blogDetalle = {
  id_blog: 1,
  titulo: 'Cómo elegir un diamante',
  descripcion_corta: 'Guía inicial',
  detalle: { descripcion_larga: '<p>Contenido original</p>' },
  imagen: 'blog1.jpg',
}

describe('Vista Modificar Blog (Admin)', () => {
  it('carga el blog desde el id de la URL, permite editarlo y guardarlo', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})

    apiFetch.mockImplementation((url) => {
      if (url === '/api/blogs/1') return Promise.resolve(respuesta(blogDetalle))
      return Promise.resolve(respuesta([blogDetalle]))
    })
    blogsApi.actualizar.mockResolvedValue({})

    renderConRuta(<ModificarBlog />, '/modificarBlog?id=1', '/modificarBlog')

    const inputTitulo = screen.getByLabelText('Título *')
    await waitFor(() => expect(inputTitulo).toHaveValue('Cómo elegir un diamante'))
    expect(screen.getByLabelText('Resumen (Descripción corta) *')).toHaveValue('Guía inicial')

    await user.clear(inputTitulo)
    await user.type(inputTitulo, 'Cómo elegir un diamante certificado')
    await user.click(screen.getByRole('button', { name: 'Modificar Blog' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/gestionBlogs'))
    expect(alerta).toHaveBeenCalledWith('El blog se actualizó correctamente')
    expect(blogsApi.actualizar).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        titulo: 'Cómo elegir un diamante certificado',
        descripcionCorta: 'Guía inicial',
        imagen: 'blog1.jpg',
      }),
    )
  })

  it('muestra alerta si se intenta guardar sin seleccionar un blog', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    apiFetch.mockResolvedValue(respuesta([blogDetalle]))

    renderConRuta(<ModificarBlog />, '/modificarBlog', '/modificarBlog')

    await user.click(screen.getByRole('button', { name: 'Modificar Blog' }))
    expect(alerta).toHaveBeenCalledWith('Por favor, selecciona un blog primero.')
    expect(blogsApi.actualizar).not.toHaveBeenCalled()
  })
})