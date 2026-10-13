import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import RegistroUsuario from '../views/registroUsuario'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

describe('Vista Registro de Usuario (Cliente)', () => {
  it('debe cargar regiones y comunas, registrar al usuario y redirigir al login', async () => {
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    apiFetch.mockImplementation((url) => {
      if (url.startsWith('/api/regiones')) return Promise.resolve(respuesta([{ id_region: 1, nombre_region: 'Región Metropolitana' }]))
      if (url.startsWith('/api/comunas')) return Promise.resolve(respuesta([{ id_comuna: 10, nombre_comuna: 'Cerrillos' }]))
      return Promise.resolve(respuesta({ id_usuario: 9 }))
    })

    renderConRuta(<RegistroUsuario />, '/registroUsuario', '/registroUsuario')

    // la comuna sigue bloqueada hasta elegir región
    expect(screen.getByRole('button', { name: 'Selecciona una región primero' })).toBeDisabled()

    fireEvent.change(screen.getByLabelText('RUN'), { target: { id: 'run', value: '19011022K' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { id: 'nombre', value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { id: 'apellidos', value: 'Soto' } })
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { id: 'correo', value: 'ana@gmail.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { id: 'password', value: 'abcd' } })
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { id: 'direccion', value: 'Calle 1 #100' } })

    fireEvent.click(await screen.findByRole('link', { name: 'Región Metropolitana' }))
    fireEvent.click(await screen.findByRole('link', { name: 'Cerrillos' }))
    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/login'))
    expect(alerta).toHaveBeenCalledWith('¡Usuario registrado con éxito!')

    const llamadaPost = apiFetch.mock.calls.find(([, opciones]) => opciones?.method === 'POST')
    expect(llamadaPost[0]).toBe('/api/usuarios')
    expect(JSON.parse(llamadaPost[1].body)).toMatchObject({
      run: '19011022K',
      nombre: 'Ana',
      correo: 'ana@gmail.com',
      id_rol: 2,
      id_region: 1,
      id_comuna: 10,
      direccion: 'Calle 1 #100',
    })
  })
})
