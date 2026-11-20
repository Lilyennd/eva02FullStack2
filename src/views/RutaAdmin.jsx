import { Navigate, Outlet } from 'react-router-dom'
import { esAdmin, esStaff, useUsuario } from '../services/sesion'

// Solo Administrador (id_rol === 2)
export default function RutaAdmin() {
  const usuario = useUsuario()
  if (!esAdmin(usuario)) return <Navigate to="/login" replace />
  return <Outlet />
}

// Staff: Administrador y Vendedor (id_rol 2 o 3)
export function RutaStaff() {
  const usuario = useUsuario()
  if (!esStaff(usuario)) return <Navigate to="/login" replace />
  return <Outlet />
}

// Cualquier usuario con sesión iniciada (Cliente, Vendedor o Admin)
export function RutaPrivada() {
  const usuario = useUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}
