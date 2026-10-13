import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import PagoCorrecto from '../views/pagoCorrecto'
import { apiFetch } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const orden = {
  id_orden: 5, numero_orden: '2026-0005', estado: 'Pagada',
  nombre_cliente: 'Ana', apellidos_cliente: 'Soto', correo_cliente: 'ana@gmail.com',
  calle: 'Calle 1', departamento: '', nombre_comuna: 'Cerrillos', nombre_region: 'Metropolitana',
  indicaciones: '', total: 2500,
  detalle: [{ nombre_producto: 'Diamante', precio_unitario: 1250, cantidad: 2, subtotal: 2500 }],
}

describe('Vista Pago Correcto', () => {
  it('muestra la boleta de la orden pagada', async () => {
    apiFetch.mockResolvedValue({ status: 200, json: async () => orden })

    renderConRuta(<PagoCorrecto />, '/pagoCorrecto?id=5', '/pagoCorrecto')

    expect(await screen.findByText('#2026-0005')).toBeInTheDocument()
    expect(apiFetch).toHaveBeenCalledWith('/api/ordenes/5')
    expect(screen.getByText('Diamante')).toBeInTheDocument()
    expect(screen.getByText(/Total pagado: \$2\.?500/)).toBeInTheDocument()
  })

  it('avisa cuando no se indica la orden', () => {
    renderConRuta(<PagoCorrecto />, '/pagoCorrecto', '/pagoCorrecto')

    expect(screen.getByText('No se indicó el número de la orden.')).toBeInTheDocument()
  })
})