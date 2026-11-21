import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminContactos from '../views/adminContactos'
import { contactoApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({ urlImagen: (img) => img,
  contactoApi: {
    listar: vi.fn(),
    marcarLeido: vi.fn(),
    eliminar: vi.fn(),
  },
}))

const mensajesMock = [
  {
    id_contacto: 1,
    nombre: 'Camila Díaz',
    correo: 'camila@gmail.com',
    comentario: 'Consulta por anillo de zafiro',
    fecha_envio: '2026-10-10T10:00:00',
    leido: false,
  },
  {
    id_contacto: 2,
    nombre: 'Pedro Morales',
    correo: 'pedro@duocuc.cl',
    comentario: 'Disponibilidad de esmeraldas',
    fecha_envio: '2026-10-11T15:30:00',
    leido: true,
  },
]

describe('Vista Bandeja de Contacto (Admin)', () => {
  it('lista los mensajes, filtra por estado/texto, marca como leído y elimina', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    contactoApi.listar.mockResolvedValue(mensajesMock)
    contactoApi.marcarLeido.mockResolvedValue({ ...mensajesMock[0], leido: true })
    contactoApi.eliminar.mockResolvedValue({})

    renderConRuta(<AdminContactos />, '/adminContactos', '/adminContactos')

    expect(await screen.findByText('Camila Díaz')).toBeInTheDocument()
    expect(screen.getByText('Pedro Morales')).toBeInTheDocument()
    expect(screen.getByText('Sin leer: 1')).toBeInTheDocument()

    // Filtrar solo mensajes "Sin leer"
    const selectEstado = screen.getByLabelText('Filtrar mensajes por estado')
    await user.selectOptions(selectEstado, 'Sin leer')
    expect(screen.getByText('Camila Díaz')).toBeInTheDocument()
    expect(screen.queryByText('Pedro Morales')).not.toBeInTheDocument()

    // Volver a "Todos" y filtrar por texto
    await user.selectOptions(selectEstado, 'Todos')
    const buscador = screen.getByPlaceholderText('Buscar por nombre, correo o contenido del mensaje')
    await user.type(buscador, 'esmeraldas')
    expect(screen.getByText('Pedro Morales')).toBeInTheDocument()
    expect(screen.queryByText('Camila Díaz')).not.toBeInTheDocument()

    // Limpiar búsqueda y marcar el mensaje nuevo como leído
    await user.clear(buscador)
    await user.click(screen.getByRole('button', { name: 'Marcar leído' }))
    await waitFor(() => expect(contactoApi.marcarLeido).toHaveBeenCalledWith(1))
    expect(await screen.findByText('Mensaje marcado como leído.')).toBeInTheDocument()
    expect(screen.getByText('Sin leer: 0')).toBeInTheDocument()

    // Eliminar el primer mensaje
    const botonesEliminar = screen.getAllByRole('button', { name: 'Eliminar' })
    await user.click(botonesEliminar[0])
    await waitFor(() => expect(contactoApi.eliminar).toHaveBeenCalledWith(1))
    expect(await screen.findByText('Mensaje eliminado correctamente.')).toBeInTheDocument()
    expect(screen.queryByText('Camila Díaz')).not.toBeInTheDocument()
  })

  it('muestra un mensaje de error si falla la carga desde el backend', async () => {
    contactoApi.listar.mockRejectedValue(new Error('Fallo de conexión'))

    renderConRuta(<AdminContactos />, '/adminContactos', '/adminContactos')

    expect(await screen.findByText(/No se pudieron cargar los mensajes: Fallo de conexión/)).toBeInTheDocument()
  })
})