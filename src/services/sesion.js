import { useMemo, useSyncExternalStore } from 'react'

const CLAVE = 'usuarioActual'
const EVENTO = 'usuarioCambiado'

// Helpers para evaluar los 3 roles
export const esAdmin = (usuario) => !!usuario && usuario.id_rol === 2
export const esVendedor = (usuario) => !!usuario && usuario.id_rol === 3
export const esCliente = (usuario) => !!usuario && usuario.id_rol === 1

// Staff (Admin o Vendedor) para acceso a Inventario y Órdenes
export const esStaff = (usuario) => !!usuario && (usuario.id_rol === 2 || usuario.id_rol === 3)

export function guardarUsuario(usuario, token) {
  localStorage.setItem(CLAVE, JSON.stringify(usuario))
  localStorage.setItem('usuario', JSON.stringify(usuario))
  if (token) localStorage.setItem('token', token)
  window.dispatchEvent(new Event(EVENTO))
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE)
  localStorage.removeItem('usuario')
  localStorage.removeItem('token')
  window.dispatchEvent(new Event(EVENTO))
}

function suscribir(avisar) {
  window.addEventListener(EVENTO, avisar)
  window.addEventListener('storage', avisar)
  return () => {
    window.removeEventListener(EVENTO, avisar)
    window.removeEventListener('storage', avisar)
  }
}

export function useUsuario() {
  const crudo = useSyncExternalStore(suscribir, () => localStorage.getItem(CLAVE) || localStorage.getItem('usuario'))
  return useMemo(() => {
    try {
      return JSON.parse(crudo)
    } catch {
      return null
    }
  }, [crudo])
}
