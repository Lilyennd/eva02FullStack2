import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Categorias from '../views/categorias'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const categorias = [
  { id_categoria: 1, nombre_categoria: 'Diamantes' },
  { id_categoria: 2, nombre_categoria: 'Rubíes' },
]
const productos = [
  { id_producto: 10, nombre: 'Diamante Rosa', precio: 1000, id_categoria: 1, stock: 3, imagen_principal: 'd.jpg' },
  { id_producto: 20, nombre: 'Rubí Birmano', precio: 2000, id_categoria: 2, stock: 1 },
]

describe('Vista Categorías (Cliente)', () => {
  it('debe cargar y renderizar las categorías con sus productos correctamente', async () => {
    apiFetch.mockImplementation((url) =>
      Promise.resolve(respuesta(url.includes('categorias') ? categorias : productos)),
    )

    renderConRuta(<Categorias />, '/categorias')

    expect(await screen.findByText('Diamante Rosa')).toBeInTheDocument()
    expect(screen.getByText('Rubí Birmano')).toBeInTheDocument()
  })
})
