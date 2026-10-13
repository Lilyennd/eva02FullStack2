import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import EditarUsuario from '../views/editarUsuario'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const usuario = {
  id_usuario: 1, run: '19011022K', nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com',
  telefono: null, direccion: 'Calle 1', id_region: 1, id_comuna: 10, id_rol: 1,
}

describe('Vista Editar Usuario', () => {
  it('si la URL no trae id, avisa y manda al perfil sin pedir nada al servidor', async () => {
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})

    renderConRuta(<EditarUsuario />, '/editarUsuario', '/editarUsuario') // sin ?id=

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/perfil'))
    expect(alerta).toHaveBeenCalledWith('No se especificó un usuario para editar.')
    expect(apiFetch).not.toHaveBeenCalled()
  })

  it('el botón Cancelar vuelve a /perfil si es comprador y a /listarUsuarios si es admin', () => {
    apiFetch.mockResolvedValue(respuesta(usuario))

    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 1, id_rol: 1 }))
    const { unmount } = renderConRuta(<EditarUsuario />, '/editarUsuario?id=1', '/editarUsuario')
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute('href', '/perfil')
    unmount() 

    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 2, id_rol: 2 }))
    renderConRuta(<EditarUsuario />, '/editarUsuario?id=1', '/editarUsuario')
    expect(screen.getByRole('link', { name: 'Cancelar' })).toHaveAttribute('href', '/listarUsuarios')
  })
})