import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminOrdenes from '../views/adminOrdenes'
import { ordenesApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ ordenesApi: { listar: vi.fn() } }))

const ordenes = [
  { id_orden: 1, numero_orden: 'A-001', estado: 'Pagada', nombre_cliente: 'Ana', apellidos_cliente: 'Soto', fecha_orden: '2026-10-01T12:00:00', total: 300000 },
  { id_orden: 2, numero_orden: 'B-002', estado: 'Pendiente', nombre_cliente: 'Luis', apellidos_cliente: 'Rojas', fecha_orden: '2026-10-02T12:00:00', total: 100000 },
]

describe('Vista Órdenes del administrador', () => {
  it('lista las órdenes y permite filtrar por estado y por texto', async () => {
    const user = userEvent.setup()
    ordenesApi.listar.mockResolvedValue(ordenes)

    renderConRuta(<AdminOrdenes />, '/adminOrdenes', '/adminOrdenes')


    expect(await screen.findByText('A-001')).toBeInTheDocument()
    expect(screen.getByText('B-002')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Ver boleta' })[0]).toHaveAttribute('href', '/mostrarBoleta?id=1')

    await user.selectOptions(screen.getByRole('combobox'), 'Pagada')
    expect(screen.getByText('A-001')).toBeInTheDocument()
    expect(screen.queryByText('B-002')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByRole('combobox'), 'Todos')
    await user.type(screen.getByRole('textbox'), 'luis')
    expect(screen.getByText('B-002')).toBeInTheDocument()
    expect(screen.queryByText('A-001')).not.toBeInTheDocument()
  })
})