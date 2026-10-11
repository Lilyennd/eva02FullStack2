import { Navigate, Outlet } from 'react-router-dom'

export function leerUsuarioActual() {
  try {
    return JSON.parse(localStorage.getItem('usuarioActual'))
  } catch {
    return null
  }
}

// Administrador (1) y Vendedor (2), igual que en el Navbar
export const esAdmin = (usuario) => !!usuario && (usuario.id_rol === 1 || usuario.id_rol === 2)

// Protege las vistas de administración: si no hay sesión de admin, manda al login
export default function RutaAdmin() {
  const usuario = leerUsuarioActual()
  if (!esAdmin(usuario)) return <Navigate to="/login" replace />
  return <Outlet />
}
