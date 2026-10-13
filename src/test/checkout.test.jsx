import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Checkout from '../views/checkout'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const carrito = [
  { id_producto: 1, nombre: 'Diamante', precio: 1000 },
  { id_producto: 2, nombre: 'Rubí', precio: 500 },
]

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  localStorage.setItem('carrito', JSON.stringify(carrito))
  apiFetch.mockImplementation((url, opciones) => {
    if (url.startsWith('/api/regiones')) return Promise.resolve(respuesta([{ id_region: 1, nombre_region: 'Metropolitana' }]))
    if (url.startsWith('/api/comunas')) return Promise.resolve(respuesta([{ id_comuna: 5, nombre_comuna: 'Santiago' }]))
    if (url.includes('productos')) return Promise.resolve(respuesta([]))
    if (url === '/api/ordenes' && opciones?.method === 'POST') return Promise.resolve(respuesta({ id_orden: 99 }))
    return Promise.resolve(respuesta({}))
  })
})

describe('Vista Checkout (Cliente)', () => {
  it('debe permitir llenar el formulario de despacho y procesar el pago con éxito', async () => {
    renderConRuta(<Checkout />, '/checkout', '/checkout')

    fireEvent.change(await screen.findByLabelText(/Nombre/), { target: { name: 'nombre', value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/Apellidos/), { target: { name: 'apellidos', value: 'Pérez' } })
    fireEvent.change(screen.getByLabelText(/Correo/), { target: { name: 'correo', value: 'ana@correo.cl' } })
    fireEvent.change(screen.getByLabelText(/Calle/), { target: { name: 'calle', value: 'Av. Siempre Viva 123' } })
    fireEvent.change(screen.getByLabelText(/Región/), { target: { value: '1' } })

    const comuna = screen.getByLabelText(/Comuna/)
    await waitFor(() => expect(comuna).toHaveTextContent('Santiago'))
    fireEvent.change(comuna, { target: { value: '5' } })

    fireEvent.click(screen.getByRole('button', { name: /Pagar ahora/ }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/pagoCorrecto?id=99'))

    const llamadaOrden = apiFetch.mock.calls.find(
      ([url, opciones]) => url === '/api/ordenes' && opciones?.method === 'POST',
    )
    expect(JSON.parse(llamadaOrden[1].body).items).toEqual([
      { id_producto: 1, cantidad: 1 },
      { id_producto: 2, cantidad: 1 },
    ])

    const llamadaPago = apiFetch.mock.calls.find(([url]) => url === '/api/ordenes/99')
    expect(JSON.parse(llamadaPago[1].body)).toEqual({ estado: 'Pagada' })
  })
})