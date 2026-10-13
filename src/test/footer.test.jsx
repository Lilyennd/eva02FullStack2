import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import Footer from '../views/Footer'
import { renderConRuta } from './utils'

describe('Componente Footer (Cliente)', () => {
  it('debe mostrar la marca, los enlaces de navegación y las redes sociales', () => {
    renderConRuta(<Footer />, '/home', '/home')

    expect(screen.getByRole('heading', { name: 'Splendor' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/productos')
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto')
    expect(screen.getByRole('link', { name: 'Blogs' })).toHaveAttribute('href', '/blogs')

    const instagram = screen.getByRole('link', { name: 'Instagram' })
    expect(instagram).toHaveAttribute('target', '_blank')
    expect(instagram).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
