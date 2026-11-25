import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NuevoProducto from '../views/nuevoProducto'
import { apiFetch, categoriasApi, subirImagen } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ urlImagen: (img) => img,
  apiFetch: vi.fn(),
  categoriasApi: { listar: vi.fn() },
  subirImagen: vi.fn(),
}))

describe('Vista Nuevo Producto (Admin)', () => {
  it('valida los campos obligatorios, crea el producto y redirige a inventario', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    categoriasApi.listar.mockResolvedValue([{ id_categoria: 1, nombre_categoria: 'Diamantes' }])
    apiFetch.mockResolvedValue(respuesta({ id_producto: 10 }, true, 201))

    renderConRuta(<NuevoProducto />, '/nuevoProducto', '/nuevoProducto')
    expect(await screen.findByRole('option', { name: 'Diamantes' })).toBeInTheDocument()

 
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
    expect(alerta).toHaveBeenCalledWith(
      'El código del producto es obligatorio y debe tener al menos 3 letras/números.',
    )
    expect(apiFetch).not.toHaveBeenCalled()


    await user.type(screen.getByLabelText('Código *'), 'DIA-02')
    await user.type(screen.getByLabelText('Nombre *'), 'Diamante Corte Princesa')
    await user.type(screen.getByLabelText('Precio *'), '1800000')
    await user.selectOptions(screen.getByLabelText('Categoría *'), '1')
    await user.type(screen.getByLabelText('Stock *'), '4')

    await user.click(screen.getByRole('button', { name: 'Guardar producto' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/inventario'))
    expect(alerta).toHaveBeenCalledWith('¡Producto creado con éxito!')

    const [url, opciones] = apiFetch.mock.calls[0]
    expect(url).toBe('/api/productos')
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toMatchObject({
      codigo_producto: 'DIA-02',
      nombre: 'Diamante Corte Princesa',
      precio: 1800000,
      id_categoria: 1,
      stock: 4,
    })
  })

  it('sube la imagen seleccionada antes de guardar el producto', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    categoriasApi.listar.mockResolvedValue([{ id_categoria: 2, nombre_categoria: 'Esmeraldas' }])
    subirImagen.mockResolvedValue('/uploads/productos/esmeralda.jpg')
    apiFetch.mockResolvedValue(respuesta({ id_producto: 11 }, true, 201))

    renderConRuta(<NuevoProducto />, '/nuevoProducto', '/nuevoProducto')
    expect(await screen.findByRole('option', { name: 'Esmeraldas' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Código *'), 'ESM-01')
    await user.type(screen.getByLabelText('Nombre *'), 'Esmeralda Colombiana')
    await user.type(screen.getByLabelText('Precio *'), '950000')
    await user.selectOptions(screen.getByLabelText('Categoría *'), '2')
    await user.type(screen.getByLabelText('Stock *'), '2')

    const archivo = new File(['imagen'], 'esmeralda.jpg', { type: 'image/jpeg' })
    await user.upload(screen.getByLabelText('Subir imagen (opcional)'), archivo)

    await user.click(screen.getByRole('button', { name: 'Guardar producto' }))

    await waitFor(() => expect(subirImagen).toHaveBeenCalledWith('productos', archivo))
    const [, opciones] = apiFetch.mock.calls[0]
    expect(JSON.parse(opciones.body)).toMatchObject({
      codigo_producto: 'ESM-01',
      imagen_principal: '/uploads/productos/esmeralda.jpg',
    })
  })
})