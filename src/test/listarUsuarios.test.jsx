import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import ListarUsuarios from '../views/listarUsuarios'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

const usuarios = [
  { id_usuario: 1, run: '19011022K', nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com', id_rol: 1 },
  { id_usuario: 2, run: '12345678', nombre: 'Prof', apellidos: 'Duoc', correo: 'prof@profesor.duoc.cl', id_rol: 2 },
]

describe('Vista Listar Usuarios', () => {
  it('muestra los usuarios con su rol y los enlaces para editar y ver historial', async () => {
    apiFetch.mockResolvedValue(respuesta(usuarios))

    renderConRuta(<ListarUsuarios />, '/listarUsuarios', '/listarUsuarios')

    expect(await screen.findByText('ana@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('prof@profesor.duoc.cl')).toBeInTheDocument()
    expect(screen.getByText('Comprador')).toBeInTheDocument()                 
    expect(screen.getByText('Administrador / Vendedor')).toBeInTheDocument()  

    expect(screen.getAllByRole('link', { name: 'Editar' })[0]).toHaveAttribute('href', '/editarUsuario?id=1')
    expect(screen.getAllByRole('link', { name: 'Historial' })[1]).toHaveAttribute('href', '/historialCompras?id=2')
    expect(screen.getByRole('link', { name: 'Nuevo usuario' })).toHaveAttribute('href', '/crearUsuario')
  })
})