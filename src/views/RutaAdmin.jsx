import { Navigate, Outlet } from 'react-router-dom'
import { esAdmin, esStaff, useUsuario } from '../services/sesion'


export default function RutaAdmin() {
  const usuario = useUsuario()
  if (!esAdmin(usuario)) return <Navigate to="/login" replace />
  return <Outlet />
}


export function RutaStaff() {
  const usuario = useUsuario()
  if (!esStaff(usuario)) return <Navigate to="/login" replace />
  return <Outlet />
}


export function RutaPrivada() {
  const usuario = useUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}
