import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { formatearPrecio, DatosCliente, TablaCompra } from '../views/DatosCompra'

const cliente = {
  nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com',
  calle: 'Calle 1', departamento: '12B', region: 'Metropolitana', comuna: 'Cerrillos',
  indicaciones: 'Dejar con el conserje',
}

const filas = [
  { nombre: 'Diamante', precio: 1250, cantidad: 2, subtotal: 2500, imagen: 'diamond.jpg' },
  { nombre: 'Rubí', precio: 3000, cantidad: 1, subtotal: 3000 },
]

describe('formatearPrecio', () => {
  it('formatea el número', () => {
    expect(formatearPrecio(12500)).toBe(Number(12500).toLocaleString('es-CL'))
  })

  it('acepta números escritos como texto', () => {
    expect(formatearPrecio('3000')).toBe(Number(3000).toLocaleString('es-CL'))
  })
})

describe('DatosCliente', () => {
  it('muestra los datos del cliente en campos de solo lectura', () => {
    render(<DatosCliente cliente={cliente} />)

    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana')
    expect(screen.getByLabelText('Apellidos')).toHaveValue('Soto')
    expect(screen.getByLabelText('Correo')).toHaveValue('ana@gmail.com')
    expect(screen.getByLabelText('Calle')).toHaveValue('Calle 1')
    expect(screen.getByLabelText('Región')).toHaveValue('Metropolitana')
    expect(screen.getByLabelText('Comuna')).toHaveValue('Cerrillos')
    expect(screen.getByLabelText(/Indicaciones/)).toHaveValue('Dejar con el conserje')
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('readonly')
  })

  it('muestra la opción de entrega solo si viene en el cliente', () => {
    const { rerender } = render(<DatosCliente cliente={cliente} />)
    expect(screen.queryByLabelText('Opción de entrega')).not.toBeInTheDocument()

    rerender(<DatosCliente cliente={{ ...cliente, entrega: 'Despacho a domicilio' }} />)
    expect(screen.getByLabelText('Opción de entrega')).toHaveValue('Despacho a domicilio')
  })
})

describe('TablaCompra', () => {
  it('muestra una fila por producto con sus precios formateados', () => {
    render(<TablaCompra filas={filas} />)

    expect(screen.getByText('Diamante')).toBeInTheDocument()
    expect(screen.getByText('Rubí')).toBeInTheDocument()
    expect(screen.getByText('$' + formatearPrecio(1250))).toBeInTheDocument()
    expect(screen.getByText('$' + formatearPrecio(2500))).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(3) 
  })

  it('muestra la columna de imagen y usa una imagen por defecto si falta', () => {
    const { container } = render(<TablaCompra filas={filas} />)
    const imagenes = container.querySelectorAll('img')

    expect(screen.getByRole('columnheader', { name: 'Imagen' })).toBeInTheDocument()
    expect(imagenes[0]).toHaveAttribute('src', '/img/productos/diamond.jpg')
    expect(imagenes[1]).toHaveAttribute('src', '/img/fondoaz.jpg')
  })

  it('oculta la columna de imagen cuando conImagen es false', () => {
    const { container } = render(<TablaCompra filas={filas} conImagen={false} />)

    expect(screen.queryByRole('columnheader', { name: 'Imagen' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })
})