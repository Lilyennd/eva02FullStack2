import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Reportes from '../views/reportes'
import { apiFetch, ordenesApi } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({
  apiFetch: vi.fn(),
  ordenesApi: { listar: vi.fn() },
}))

describe('Vista Reportes', () => {
  it('calcula ingresos, inventario y agrupa las órdenes por estado', async () => {
    ordenesApi.listar.mockResolvedValue([
      { id_orden: 1, estado: 'Pagada', total: 300000 },
      { id_orden: 2, estado: 'Pagada', total: 200000 },
      { id_orden: 3, estado: 'Pendiente', total: 100000 },
    ])
    apiFetch.mockResolvedValue(respuesta([
      { id_producto: 1, codigo_producto: 'DIA-01', nombre: 'Diamante', stock: 3, precio: 1000000 },
      { id_producto: 2, codigo_producto: 'RUB-01', nombre: 'Rubí', stock: 2, precio: 400000 },
    ]))

    renderConRuta(<Reportes />, '/reportes', '/reportes')

    expect(await screen.findByText('$3.800.000')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getAllByText('$500.000')).toHaveLength(2)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('$100.000')).toBeInTheDocument()
  })
})