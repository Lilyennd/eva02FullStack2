import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../views/login'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', async () => {
  const real = await vi.importActual('../services/api')
  return { ...real, urlImagen: (img) => img, apiFetch: vi.fn(real.apiFetch) }
})

describe('Vista Login (Cliente)', () => {
  it('debe validar el formulario, iniciar sesión y redirigir según el rol', async () => {
    apiFetch.mockResolvedValue(respuesta({ usuario: { id_usuario: 3, nombre: 'Ana', id_rol: 1 } }))

    renderConRuta(<Login />, '/login', '/login')

    const correo = screen.getByLabelText('Correo Electrónico')
    const password = screen.getByLabelText('Contraseña')
    const entrar = screen.getByRole('button', { name: 'Entrar' })

    fireEvent.change(correo, { target: { value: 'ana@hotmail.com' } })
    fireEvent.change(password, { target: { value: 'abcd' } })
    fireEvent.click(entrar)
    expect(screen.getByText(/Correo no permitido/)).toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()

    fireEvent.change(correo, { target: { value: 'ana@gmail.com' } })
    fireEvent.change(password, { target: { value: 'ab' } })
    fireEvent.click(entrar)
    expect(screen.getByText('La contraseña debe tener entre 4 y 10 caracteres.')).toBeInTheDocument()

    fireEvent.change(password, { target: { value: 'abcd' } })
    fireEvent.click(entrar)

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/home'))
    const [url, opciones] = apiFetch.mock.calls[0]
    expect(url).toBe('/api/login')
    expect(JSON.parse(opciones.body)).toEqual({ correo: 'ana@gmail.com', password: 'abcd' })
    expect(JSON.parse(localStorage.getItem('usuarioActual')).nombre).toBe('Ana')
  })

  it('manda al administrador (id_rol 2) al panel /admin', async () => {
    apiFetch.mockResolvedValue(respuesta({ usuario: { id_usuario: 1, nombre: 'Prof', id_rol: 2 } }))

    renderConRuta(<Login />, '/login', '/login')

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'prof@profesor.duoc.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'abcd' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/admin'))
  })

  it('con el backend real: el admin inicia sesión, guarda el token y va a /admin', async () => {
    const real = await vi.importActual('../services/api')
    apiFetch.mockImplementation(real.apiFetch)
    localStorage.clear()

    renderConRuta(<Login />, '/login', '/login')

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'admin@profesor.duoc.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'admin123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(
      () => expect(screen.getByTestId('ubicacion')).toHaveTextContent('/admin'),
      { timeout: 8000 }
    )
    expect(localStorage.getItem('token')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('usuarioActual')).correo).toBe('admin@profesor.duoc.cl')
  }, 15000)

  it('con el backend real: una contraseña incorrecta muestra el error', async () => {
    const real = await vi.importActual('../services/api')
    apiFetch.mockImplementation(real.apiFetch)
    localStorage.clear()

    renderConRuta(<Login />, '/login', '/login')

    fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'admin@profesor.duoc.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'mala1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(
      await screen.findByText('Credenciales inválidas', {}, { timeout: 8000 })
    ).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  }, 15000)
})