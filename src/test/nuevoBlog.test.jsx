import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NuevoBlog from '../views/nuevoBlog'
import { blogsApi, subirImagen } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ urlImagen: (img) => img,
  blogsApi: { crear: vi.fn() },
  subirImagen: vi.fn(),
}))

describe('Vista Nuevo Blog (Admin)', () => {
  it('valida los campos obligatorios y crea un blog con imagen adjunta', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    subirImagen.mockResolvedValue('/uploads/blogs/diamante.jpg')
    blogsApi.crear.mockResolvedValue({ id_blog: 10 })

    renderConRuta(<NuevoBlog />, '/nuevoBlog', '/nuevoBlog')


    await user.click(screen.getByRole('button', { name: 'Guardar blog' }))
    expect(alerta).toHaveBeenCalledWith('El título del blog es obligatorio.')
    expect(blogsApi.crear).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Título del Blog *'), 'Historia del Rubí')
    await user.click(screen.getByRole('button', { name: 'Guardar blog' }))
    expect(alerta).toHaveBeenCalledWith('El resumen (descripción corta) es obligatorio.')
    expect(blogsApi.crear).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Resumen (Descripción corta) *'), 'Origen y valor histórico')
    await user.type(screen.getByLabelText('Contenido completo'), 'Primer párrafo\nSegundo párrafo')

    const archivo = new File(['contenido'], 'diamante.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText('Imagen del Blog'), archivo)

    await user.click(screen.getByRole('button', { name: 'Guardar blog' }))

    await waitFor(() => expect(subirImagen).toHaveBeenCalledWith('blogs', archivo))
    expect(blogsApi.crear).toHaveBeenCalledWith({
      titulo: 'Historia del Rubí',
      descripcionCorta: 'Origen y valor histórico',
      imagen: '/uploads/blogs/diamante.jpg',
      detalle: {
        descripcionLarga: '<p>Primer párrafo</p><p>Segundo párrafo</p>',
      },
    })
    expect(alerta).toHaveBeenCalledWith('¡Blog creado con éxito!')
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/gestionBlogs')
  })
})