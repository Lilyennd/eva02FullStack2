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


  it('visitante: muestra el menú de la tienda, el contador del carrito y "Iniciar sesión"', async () => {
    localStorage.setItem(
      'carrito',
      JSON.stringify([
        { nombre: 'Rubí', precio: 1000, id_producto: 1 },
        { nombre: 'Zafiro', precio: 500, id_producto: 2 },
      ]),
    )
    
    renderConRuta(<Navbar />, '/home', '/home')

    const enlaces = ['Inicio', 'Productos', 'Categorías', 'Ofertas', 'Nosotros', 'Blogs', 'Contacto']
    for (const texto of enlaces) {
      expect(await screen.findByRole('link', { name: texto })).toBeInTheDocument()
    }

    expect(await screen.findByText('2')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })

  it('comprador con sesión (id_rol 1): ve "Mi perfil" y NO el menú de admin', () => {
    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 1, id_rol: 1, nombre: 'Ana' }))
    renderConRuta(<Navbar />, '/home', '/home')
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })

  it('administrador (id_rol 2): ve el menú de admin y no ve el carrito', () => {
    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 2, id_rol: 2 }))
    renderConRuta(<Navbar />, '/home', '/home')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: 'Reportes' })).toHaveAttribute('href', '/reportes')
    expect(screen.queryByRole('button', { name: /Carrito/ })).not.toBeInTheDocument()
  })
})