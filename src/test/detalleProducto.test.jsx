import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import DetalleProducto from '../views/detalleProducto'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const producto = {
  id_producto: 2,
  nombre: 'Rubí Birmano',
  origen: 'Birmania',
  descripcion: 'Rubí en oferta',
  precio: 1200000,
  precio_oferta: 990000,
  en_oferta: 1,
  stock: 5,
  kilates: '1.5',
  corte: 'Oval',
  certificado: 'GIA',
}

describe('Vista Detalle de Producto (Cliente)', () => {
  it('debe mostrar el producto del id de la URL con su oferta y agregarlo al carrito', async () => {
    apiFetch.mockResolvedValue(respuesta(producto))

    renderConRuta(<DetalleProducto />, '/detalleProducto?id=2', '/detalleProducto')

    expect(await screen.findByRole('heading', { level: 1, name: 'Rubí Birmano' })).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/productos/2')
    expect(screen.getByText('Oferta')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('$990.000')
    expect(screen.getByText('Corte:').closest('li')).toHaveTextContent('Oval')
    expect(screen.getByText('Stock disponible:').closest('li')).toHaveTextContent('5')

    fireEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }))
    expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([
      { nombre: 'Rubí Birmano', precio: 990000, id_producto: 2 },
    ])
  })
})
