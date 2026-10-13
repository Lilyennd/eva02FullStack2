import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModificarProducto from '../views/modificarProducto'
import { apiFetch, categoriasApi } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({
  apiFetch: vi.fn(),
  categoriasApi: { listar: vi.fn() },
}))

const producto = {
  id_producto: 1, codigo_producto: 'DIA-01', nombre: 'Diamante Azul', precio: 2500000,
  stock: 3, stock_critico: 1, id_categoria: 1,
}

describe('Vista Modificar Producto', () => {
  it('carga el producto del id de la URL, permite editarlo y guardarlo', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    categoriasApi.listar.mockResolvedValue([{ id_categoria: 1, nombre_categoria: 'Diamantes' }])
    apiFetch.mockImplementation((url, opciones) =>
      Promise.resolve(opciones?.method === 'PUT' ? respuesta({}) : respuesta([producto])),
    )

    renderConRuta(<ModificarProducto />, '/modificarProducto?id=1', '/modificarProducto')


    const nombre = screen.getByLabelText('Nombre *')
    await waitFor(() => expect(nombre).toHaveValue('Diamante Azul'))

    await user.clear(nombre)
    await user.type(nombre, 'Diamante Rojo')
    await user.click(screen.getByRole('button', { name: 'Modificar Producto' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/inventario'))
    expect(alerta).toHaveBeenCalledWith('El producto se actualizó correctamente')

    const llamadaPut = apiFetch.mock.calls.find(([, o]) => o?.method === 'PUT')
    expect(llamadaPut[0]).toBe('/api/productos/1')
    expect(JSON.parse(llamadaPut[1].body)).toMatchObject({ nombre: 'Diamante Rojo', precio: 2500000 })
  })
})