import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import PagoCorrecto from '../views/pagoCorrecto'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const orden = {
  id_orden: 7,
  numero_orden: '20261012-0007',
  estado: 'Pagada',
  nombre_cliente: 'Ana',
  apellidos_cliente: 'Pérez',
  correo_cliente: 'ana@correo.cl',
  calle: 'Av. Siempre Viva 123',
  nombre_region: 'Metropolitana',
  nombre_comuna: 'Santiago',
  total: 2500,
  detalle: [{ id_producto: 1, nombre_producto: 'Diamante', precio_unitario: 1250, cantidad: 2, subtotal: 2500 }],
}

describe('Vista Pago Correcto (Cliente)', () => {
  it('debe cargar y mostrar el resumen de la orden pagada exitosamente', async () => {
    apiFetch.mockResolvedValue(respuesta(orden))

    renderConRuta(<PagoCorrecto />, '/pagoCorrecto?id=7')

    expect(await screen.findByText('#20261012-0007')).toBeInTheDocument()
    expect(screen.getByText(/Total pagado: \$2\.500/)).toBeInTheDocument()
  })
})