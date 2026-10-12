import { useMemo, useSyncExternalStore } from 'react'

const CLAVE = 'usuarioActual'
const EVENTO = 'usuarioCambiado'


export const esAdmin = (usuario) => !!usuario && usuario.id_rol === 2

export function guardarUsuario(usuario) {
  localStorage.setItem(CLAVE, JSON.stringify(usuario))
  window.dispatchEvent(new Event(EVENTO))
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE)
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
  const crudo = useSyncExternalStore(suscribir, () => localStorage.getItem(CLAVE))
  return useMemo(() => {
    try {
      return JSON.parse(crudo)
    } catch {
      return null
    }
  }, [crudo])
}