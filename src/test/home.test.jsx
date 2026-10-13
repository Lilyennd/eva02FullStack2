import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../views/home'

const PREGUNTA_1 = '¿Todas las gemas incluyen certificado de autenticidad?'
const PREGUNTA_2 = '¿Venden las piedras sueltas o montadas en joyas?'

describe('Vista Home (Cliente)', () => {
  it('debe mostrar la portada y un acordeón de preguntas frecuentes que abre y cierra', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { level: 1, name: 'Splendor' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(6)

    const primera = screen.getByRole('button', { name: PREGUNTA_1 })
    const segunda = screen.getByRole('button', { name: PREGUNTA_2 })
    expect(primera).toHaveAttribute('aria-expanded', 'true')
    expect(segunda).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(segunda)
    expect(segunda).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(primera)
    expect(primera).toHaveAttribute('aria-expanded', 'false')
  })
})
