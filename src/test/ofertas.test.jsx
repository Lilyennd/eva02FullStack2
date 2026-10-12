import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Ofertas from '../views/ofertas'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const ofertas = [
  { id_producto: 2, nombre: 'Diamante Rosa', precio: 2800000, precio_oferta: 2400000, en_oferta: 1, stock: 4 },
  { id_producto: 4, nombre: 'Diamante Clásico', precio: 900000, precio_oferta: 750000, en_oferta: 1, stock: 15 },
]

describe('Vista Ofertas (Cliente)', () => {
  it('debe solicitar las ofertas al backend y listar los productos en oferta', async () => {
    apiFetch.mockResolvedValue(respuesta(ofertas))

    renderConRuta(<Ofertas />, '/ofertas')

    expect(await screen.findByText('Diamante Rosa')).toBeInTheDocument()
    expect(screen.getByText('Diamante Clásico')).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/productos?oferta=1')
  })
})