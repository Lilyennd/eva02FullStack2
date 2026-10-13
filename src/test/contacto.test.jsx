import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Contacto from '../views/contacto'
import { apiFetch } from '../services/api'
import { renderConRuta, respuesta } from './utils'

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }))

describe('Vista Contacto (Cliente)', () => {
  it('debe validar el correo y enviar el mensaje al backend con datos válidos', async () => {
    const alerta = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    apiFetch.mockResolvedValue(respuesta({ ok: true }))

    renderConRuta(<Contacto />, '/contacto')

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { id: 'nombre', value: 'Ana Soto' } })
    fireEvent.change(screen.getByLabelText('Comentario'), { target: { id: 'comentario', value: 'Quiero cotizar una gema' } })

    // 1) correo inválido: muestra el error y NO llama al backend
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { id: 'correo', value: 'ana@dominio' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText(/Ingresa un correo válido/)).toBeInTheDocument()
    expect(apiFetch).not.toHaveBeenCalled()

    // 2) correo válido: envía el formulario y limpia los campos
    fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { id: 'correo', value: 'ana@gmail.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    await waitFor(() => expect(alerta).toHaveBeenCalledWith('¡Gracias! Tu mensaje fue enviado.'))
    const [url, opciones] = apiFetch.mock.calls[0]
    expect(url).toBe('/api/contacto')
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toEqual({
      nombre: 'Ana Soto',
      correo: 'ana@gmail.com',
      comentario: 'Quiero cotizar una gema',
    })
    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue(''))
  })
})
