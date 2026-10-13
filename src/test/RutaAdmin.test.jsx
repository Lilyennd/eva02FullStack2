import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RutaAdmin, { RutaPrivada } from '../views/RutaAdmin'


function dibujar(Guardia, ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route element={<Guardia />}>
          <Route path="/protegida" element={<p>Contenido protegido</p>} />
        </Route>
        <Route path="/login" element={<p>Pantalla de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Guardias de ruta', () => {
  it('RutaAdmin: deja pasar solo al admin (rol 2) y manda al login a los demás', () => {
    const sinSesion = dibujar(RutaAdmin, '/protegida')
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    sinSesion.unmount() 

    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 1, id_rol: 1 }))
    const comprador = dibujar(RutaAdmin, '/protegida')
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    comprador.unmount()

    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 2, id_rol: 2 }))
    dibujar(RutaAdmin, '/protegida')
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('RutaPrivada: deja pasar a cualquiera con sesión', () => {
    const sinSesion = dibujar(RutaPrivada, '/protegida')
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    sinSesion.unmount()

    localStorage.setItem('usuarioActual', JSON.stringify({ id_usuario: 1, id_rol: 1 }))
    dibujar(RutaPrivada, '/protegida')
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})