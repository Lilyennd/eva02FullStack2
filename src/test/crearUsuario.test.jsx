import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CrearUsuario from '../views/crearUsuario'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

describe('Vista Crear Usuario (admin)', () => {
  it('crea un usuario con correo Duoc como rol 2 y vuelve a la lista', async () => {
    const user = userEvent.setup()
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    apiFetch.mockImplementation((url) => {
      if (url.startsWith('/api/regiones')) return Promise.resolve(respuesta([{ id_region: 1, nombre_region: 'Región Metropolitana' }]))
      if (url.startsWith('/api/comunas')) return Promise.resolve(respuesta([{ id_comuna: 10, nombre_comuna: 'Cerrillos' }]))
      return Promise.resolve(respuesta({ id_usuario: 9 }))
    })

    renderConRuta(<CrearUsuario />, '/crearUsuario', '/crearUsuario')

    // la comuna está bloqueada hasta elegir región
    expect(screen.getByLabelText('Comuna')).toBeDisabled()

    await user.type(screen.getByLabelText('RUN'), '12345678')
    await user.type(screen.getByLabelText('Nombre'), 'Prof')
    await user.type(screen.getByLabelText('Apellidos'), 'Duoc')
    await user.type(screen.getByLabelText('Correo Electrónico'), 'prof@profesor.duoc.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'abcd')
    await user.type(screen.getByLabelText('Dirección'), 'Calle 5 #20')

    await screen.findByRole('option', { name: 'Región Metropolitana' })
    await user.selectOptions(screen.getByLabelText('Región'), 'Región Metropolitana')
    await screen.findByRole('option', { name: 'Cerrillos' })
    await user.selectOptions(screen.getByLabelText('Comuna'), 'Cerrillos')
    await user.click(screen.getByRole('button', { name: 'Registrar Usuario' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/listarUsuarios'))
    expect(alerta).toHaveBeenCalledWith('¡Usuario registrado con éxito!')

    const llamadaPost = apiFetch.mock.calls.find(([, o]) => o?.method === 'POST')
    expect(JSON.parse(llamadaPost[1].body)).toMatchObject({
      correo: 'prof@profesor.duoc.cl', id_rol: 2, id_region: 1, id_comuna: 10,
    })
  })
})