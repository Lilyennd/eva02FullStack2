import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import ProductosCriticos from '../views/productosCriticos'
import { productosApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ productosApi: { criticos: vi.fn() } }))

describe('Vista Productos Críticos', () => {
  it('lista los productos con stock bajo y enlaza a reponerlos', async () => {
    productosApi.criticos.mockResolvedValue([
      { id_producto: 1, codigo_producto: 'DIA-01', nombre: 'Diamante Azul', nombre_categoria: 'Diamantes', stock: 2, stock_critico: 5 },
    ])

    renderConRuta(<ProductosCriticos />, '/productosCriticos', '/productosCriticos')

    expect(await screen.findByText('Diamante Azul')).toBeInTheDocument()
    expect(screen.getByText('DIA-01')).toBeInTheDocument()
    expect(screen.getByText('Diamantes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reponer' })).toHaveAttribute('href', '/modificarProducto?id=1')
  })

  it('muestra un mensaje si no hay productos críticos', async () => {
    productosApi.criticos.mockResolvedValue([]) 

    renderConRuta(<ProductosCriticos />, '/productosCriticos', '/productosCriticos')

    expect(await screen.findByText('No hay productos con stock crítico.')).toBeInTheDocument()
  })
})