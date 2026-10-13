import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MostrarBoleta from '../views/mostrarBoleta'
import { ordenesApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ ordenesApi: { obtener: vi.fn() } }))

const orden = {
  id_orden: 5, numero_orden: '2026-0005', estado: 'Pagada', fecha_orden: '2026-10-01T12:00:00',
  nombre_cliente: 'Ana', apellidos_cliente: 'Soto', correo_cliente: 'ana@gmail.com',
  calle: 'Calle 1', departamento: '', nombre_comuna: 'Cerrillos', nombre_region: 'Metropolitana',
  indicaciones: 'Dejar con el conserje', descuento: 500, costo_envio: 0, total: 2500,
  detalle: [{ id_producto: 1, nombre_producto: 'Diamante', precio_unitario: 1250, cantidad: 2, subtotal: 2500 }],
}

describe('Vista Mostrar Boleta', () => {
  it('pide la orden del id de la URL, muestra la boleta y permite imprimirla', async () => {
    const user = userEvent.setup()
    ordenesApi.obtener.mockResolvedValue(orden)
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})

    renderConRuta(<MostrarBoleta />, '/mostrarBoleta?id=5', '/mostrarBoleta')

    expect(await screen.findByRole('heading', { name: 'Boleta N° 2026-0005' })).toBeInTheDocument()
    expect(ordenesApi.obtener).toHaveBeenCalledWith('5')
    expect(screen.getByText('Diamante')).toBeInTheDocument()
    expect(screen.getByText('Descuento: -$500')).toBeInTheDocument()
    expect(screen.getByText(/Total: \$2\.?500/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Imprimir boleta' }))
    expect(imprimir).toHaveBeenCalledTimes(1)
  })
})