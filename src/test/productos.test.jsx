import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Productos from '../views/productos'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const productos = [
  { id_producto: 1, nombre: 'Diamante Brillante', origen: 'Sudáfrica', precio: 2500000, en_oferta: 0, stock: 1 },
  { id_producto: 2, nombre: 'Rubí Birmano', origen: 'Birmania', precio: 1200000, precio_oferta: 990000, en_oferta: 1, stock: 5 },
]

describe('Vista Productos (Cliente)', () => {
  it('debe listar los productos, mostrar la oferta y agregar al carrito respetando el stock', async () => {
    apiFetch.mockResolvedValue(respuesta(productos))

    renderConRuta(<Productos />, '/productos')

    expect(await screen.findByRole('heading', { name: 'Diamante Brillante' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rubí Birmano' })).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/productos')
    expect(screen.getAllByText('Oferta')).toHaveLength(1) // solo el rubí está en oferta

    const botones = screen.getAllByRole('button', { name: 'Agregar' })

    // el rubí se guarda con su precio de oferta
    fireEvent.click(botones[1])
    expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([
      { nombre: 'Rubí Birmano', precio: 990000, id_producto: 2 },
    ])

    // el diamante tiene stock 1: tras agregarlo el botón queda deshabilitado
    fireEvent.click(botones[0])
    await waitFor(() => expect(botones[0]).toBeDisabled())
  })
})
