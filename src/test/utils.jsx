import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

// Simula la respuesta de fetch: { ok, status, json() }
export const respuesta = (datos, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => datos,
})

// Muestra la ruta actual para comprobar redirecciones
export function UbicacionActual() {
  const { pathname, search } = useLocation()
  return <div data-testid="ubicacion">{pathname + search}</div>
}

// Renderiza una vista dentro de un router en memoria
export function renderConRuta(ui, ruta = '/', path = '*') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="*" element={<UbicacionActual />} />
      </Routes>
    </MemoryRouter>,
  )
}
