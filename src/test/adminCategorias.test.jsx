import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminCategorias from '../views/adminCategorias'
import { categoriasApi } from '../services/api'
import { renderConRuta } from './utils'

vi.mock('../services/api', () => ({
  categoriasApi: { listar: vi.fn(), crear: vi.fn(), actualizar: vi.fn() },
}))

describe('Vista Categorías del administrador', () => {
  it('valida el nombre, crea una categoría y edita otra', async () => {
    const user = userEvent.setup()
    categoriasApi.listar.mockResolvedValue([{ id_categoria: 1, nombre_categoria: 'Diamantes' }])
    categoriasApi.crear.mockResolvedValue({})
    categoriasApi.actualizar.mockResolvedValue({})

    renderConRuta(<AdminCategorias />, '/adminCategorias', '/adminCategorias')
    expect(await screen.findByText('Diamantes')).toBeInTheDocument()


    await user.click(screen.getByRole('button', { name: 'Crear' }))
    expect(await screen.findByText('El nombre de la categoría es obligatorio.')).toBeInTheDocument()
    expect(categoriasApi.crear).not.toHaveBeenCalled()

    await user.type(screen.getByRole('textbox'), 'Zafiros')
    await user.click(screen.getByRole('button', { name: 'Crear' }))
    await waitFor(() => expect(categoriasApi.crear).toHaveBeenCalledWith('Zafiros'))
    expect(await screen.findByText('Categoría creada.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(screen.getByRole('textbox')).toHaveValue('Diamantes')
    await user.clear(screen.getByRole('textbox'))
    await user.type(screen.getByRole('textbox'), 'Diamantes Finos')
    await user.click(screen.getByRole('button', { name: 'Actualizar' }))

    await waitFor(() => expect(categoriasApi.actualizar).toHaveBeenCalledWith(1, 'Diamantes Finos'))
    expect(await screen.findByText('Categoría actualizada.')).toBeInTheDocument()
  })
})