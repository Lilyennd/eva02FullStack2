import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Inventario from '../views/inventario'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ urlImagen: (img) => img, apiFetch: vi.fn() }))

const productos = [
  { id_producto: 1, nombre: 'Diamante Azul', stock: 3, origen: 'Sudáfrica', precio: 2500000 },
  { id_producto: 2, nombre: 'Rubí Birmano', stock: 7, origen: 'Birmania', precio: 1200000 },
]

describe('Vista Inventario', () => {
  it('lista los productos con su stock y enlaza a modificar y a nuevo producto', async () => {
    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 2, id_rol: 2 }))
    apiFetch.mockResolvedValue(respuesta(productos))

    renderConRuta(<Inventario />, '/inventario', '/inventario')

    expect(await screen.findByRole('heading', { name: 'Diamante Azul' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rubí Birmano' })).toBeInTheDocument()
    expect(screen.getByText('Stock: 3')).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/productos')

    expect(screen.getAllByRole('link', { name: 'Modificar' })[0]).toHaveAttribute('href', '/modificarProducto/1')
    expect(screen.getByRole('link', { name: 'Agregar Nuevo Producto' })).toHaveAttribute('href', '/nuevoProducto')
  })
})