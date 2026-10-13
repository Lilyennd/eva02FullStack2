import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Navbar from '../views/Navbar'
import { renderConRuta } from './utils'


vi.mock('bootstrap', () => ({
  Offcanvas: class {
    static getInstance() {
      return null
    }
    hide() {}
  },
}))

describe('Componente Navbar (Cliente)', () => {
  it('visitante: muestra el menú de la tienda, el contador del carrito y "Iniciar sesión"', () => {
    localStorage.setItem(
      'carrito',
      JSON.stringify([
        { nombre: 'Rubí', precio: 1000, id_producto: 1 },
        { nombre: 'Zafiro', precio: 500, id_producto: 2 },
      ]),
    )

    renderConRuta(<Navbar />, '/home', '/home')

    ;['Inicio', 'Productos', 'Categorías', 'Ofertas', 'Nosotros', 'Blogs', 'Contacto'].forEach((texto) => {
      expect(screen.getByRole('link', { name: texto })).toBeInTheDocument()
    })
    expect(screen.getByText('2')).toBeInTheDocument() // contador del carrito
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })
})
