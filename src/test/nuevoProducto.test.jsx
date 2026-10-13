import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NuevoProducto from '../views/nuevoProducto'
import { apiFetch, categoriasApi } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({
  apiFetch: vi.fn(),
  categoriasApi: { listar: vi.fn() },
}))

describe('Vista Nuevo Producto', () => {
  it('valida el código y, con datos correctos, crea el producto y vuelve al inventario', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    categoriasApi.listar.mockResolvedValue([{ id_categoria: 1, nombre_categoria: 'Diamantes' }])
    apiFetch.mockResolvedValue(respuesta({ id_producto: 50 }))

    renderConRuta(<NuevoProducto />, '/nuevoProducto', '/nuevoProducto')

   
    await user.click(screen.getByRole('button', { name: 'Guardar producto' }))
    expect(alerta).toHaveBeenCalledWith('El código del producto es obligatorio y debe tener al menos 3 letras/números.')
    expect(apiFetch).not.toHaveBeenCalled()


    await user.type(screen.getByLabelText('Código *'), 'DIA-01')
    await user.type(screen.getByLabelText('Nombre *'), 'Diamante Azul')
    await user.type(screen.getByLabelText('Precio *'), '2500000')
    await user.type(screen.getByLabelText('Stock *'), '3')
    await screen.findByRole('option', { name: 'Diamantes' }) 
    await user.selectOptions(screen.getByLabelText('Categoría *'), '1')

    await user.click(screen.getByRole('button', { name: 'Guardar producto' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/inventario'))
    expect(alerta).toHaveBeenCalledWith('¡Producto creado con éxito!')

    const [url, opciones] = apiFetch.mock.calls[0]
    expect(url).toBe('/api/productos')
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toMatchObject({
      codigo_producto: 'DIA-01', nombre: 'Diamante Azul', precio: 2500000, stock: 3, id_categoria: 1,
    })
  })
})