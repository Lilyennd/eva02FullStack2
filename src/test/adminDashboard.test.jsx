import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import AdminDashboard from '../views/adminDashboard'
import { dashboardApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ dashboardApi: { resumen: vi.fn() } }))

describe('Vista Dashboard del administrador', () => {
  it('muestra las tarjetas de resumen y los accesos rápidos', async () => {
    dashboardApi.resumen.mockResolvedValue({
      compras: 12, ingresos: 3500000, productos: 8, inventario_unidades: 40,
      usuarios: 5, usuarios_nuevos_30d: 2, productos_criticos: 1, mensajes_sin_leer: 3,
    })

    renderConRuta(<AdminDashboard />, '/admin', '/admin')

    expect(await screen.findByText('Ingresos: $3.500.000')).toBeInTheDocument()
    expect(screen.getByText('Inventario: 40 unidades')).toBeInTheDocument()
    expect(screen.getByText('Nuevos (30 días): 2')).toBeInTheDocument()

   
    expect(screen.getByRole('link', { name: 'Reportes' })).toHaveAttribute('href', '/reportes')
    expect(screen.getByRole('link', { name: 'Órdenes / Boletas' })).toHaveAttribute('href', '/adminOrdenes')
  })
})