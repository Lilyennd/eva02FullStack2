import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import Nosotros from '../views/nosotros'
import { renderConRuta } from './utils'

describe('Vista Nosotros (Cliente)', () => {
  it('debe mostrar las gemas, las 5 etapas de creación y los botones de compra', () => {
    renderConRuta(<Nosotros />, '/nosotros', '/nosotros')

    expect(screen.getByRole('heading', { name: 'Quiénes somos' })).toBeInTheDocument()
    ;['Diamante', 'Rubí', 'Zafiro', 'Esmeralda'].forEach((gema) => {
      expect(screen.getByRole('heading', { level: 3, name: gema })).toBeInTheDocument()
    })
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5)
    expect(screen.getByRole('link', { name: 'Comprar ahora' })).toHaveAttribute('href', '/productos')
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/registroUsuario')
  })
})
