import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import HistorialCompras from '../views/historialCompras'
import { ordenesApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ ordenesApi: { listar: vi.fn() } }))

describe('Vista Historial de Compras', () => {
  it('pide las órdenes del usuario de la URL y enlaza cada una a su boleta', async () => {
    ordenesApi.listar.mockResolvedValue([
      { id_orden: 7, numero_orden: '2026-0007', estado: 'Pagada', nombre_cliente: 'Ana', apellidos_cliente: 'Soto', fecha_orden: '2026-10-01T12:00:00', total: 2500 },
    ])

    renderConRuta(<HistorialCompras />, '/historialCompras?id=3', '/historialCompras')

    expect(await screen.findByText('2026-0007')).toBeInTheDocument()
    expect(ordenesApi.listar).toHaveBeenCalledWith('3') 
    expect(screen.getByRole('link', { name: 'Ver boleta' })).toHaveAttribute('href', '/mostrarBoleta?id=7')
  })
})