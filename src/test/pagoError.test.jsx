import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import PagoError from '../views/pagoError'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const respaldo = {
  mensaje: 'Stock insuficiente',
  total: 990000,
  items: [{ nombre: 'Rubí Birmano', precio: 990000, cantidad: 1 }],
  datos: {
    nombre: 'Luis',
    apellidos: 'Rojas',
    correo: 'luis@gmail.com',
    calle: 'Calle 2',
    departamento: '',
    nombre_region: 'Región Metropolitana',
    nombre_comuna: 'Cerrillos',
    indicaciones: '',
  },
}

describe('Vista Pago Error (Cliente)', () => {
  it('debe mostrar el motivo del fallo con los datos del checkout y permitir reintentar el pago', async () => {
    sessionStorage.setItem('checkoutError', JSON.stringify(respaldo))

    renderConRuta(<PagoError />, '/pagoError', '/pagoError')

    expect(await screen.findByText(/No se pudo realizar el pago/)).toBeInTheDocument()
    expect(screen.getByText('Stock insuficiente')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Luis')
    expect(screen.getByRole('row', { name: /Rubí Birmano/ })).toBeInTheDocument()
    expect(screen.getByText(/Total a pagar: \$990\.000/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'VOLVER A REALIZAR EL PAGO' }))
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/checkout')
  })
})
