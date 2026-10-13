import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Perfil from '../views/perfil'
import { usuariosApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ usuariosApi: { obtener: vi.fn() } }))

describe('Vista Perfil', () => {
  it('muestra los datos del usuario con sesión y enlaza a editar y a sus compras', async () => {
    // sesión iniciada
    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 1, id_rol: 1 }))
    usuariosApi.obtener.mockResolvedValue({
      id_usuario: 1, nombre: 'Ana', apellidos: 'Soto', run: '19011022K',
      correo: 'ana@gmail.com', telefono: '+56912345678',
    })

    renderConRuta(<Perfil />, '/perfil', '/perfil')

    expect(await screen.findByText('Ana Soto')).toBeInTheDocument()
    expect(usuariosApi.obtener).toHaveBeenCalledWith(1)
    expect(screen.getByText('19011022K')).toBeInTheDocument()
    expect(screen.getByText('ana@gmail.com')).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Editar datos' })).toHaveAttribute('href', '/editarUsuario?id=1')
    expect(screen.getByRole('link', { name: 'Mis compras' })).toHaveAttribute('href', '/historialCompras?id=1')
  })

  it('sin sesión muestra el aviso "Debes iniciar sesión."', () => {
    // no se guarda ninguna sesión
    renderConRuta(<Perfil />, '/perfil', '/perfil')

    expect(screen.getByText('Debes iniciar sesión.')).toBeInTheDocument()
    expect(usuariosApi.obtener).not.toHaveBeenCalled()
  })
})