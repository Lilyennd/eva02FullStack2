import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import Carrito from '../views/Carrito'
import { renderConRuta } from './utils'

vi.mock('bootstrap', () => ({
  Offcanvas: class {
    static getInstance() {
      return null
    }
    hide() {}
  },
}))

const carrito = [
  { nombre: 'Rubí', precio: 1000, id_producto: 1 },
  { nombre: 'Zafiro', precio: 2500, id_producto: 2 },
]

describe('Componente Carrito lateral (Cliente)', () => {
  it('debe listar los productos recibidos por props, calcular el total y ejecutar sus acciones', () => {
    const onQuitar = vi.fn()
    const onVaciar = vi.fn()
    const onPagar = vi.fn()

    renderConRuta(
      <Carrito carrito={carrito} onQuitar={onQuitar} onVaciar={onVaciar} onPagar={onPagar} />,
      '/carrito',
      '/carrito',
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('3.500')).toBeInTheDocument() // total: 1.000 + 2.500

    fireEvent.click(screen.getAllByRole('button', { name: '✕' })[1])
    expect(onQuitar).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByRole('button', { name: 'Vaciar Carrito' }))
    expect(onVaciar).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Ir a Pagar' }))
    expect(onPagar).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Ver Detalles de la Compra/ }))
    expect(screen.getByTestId('ubicacion')).toHaveTextContent('/checkout')
  })
})
