// =====================================================================
// Capa de datos del frontend (equivale al "archivo JS de datos con CRUD"
// que pide la evaluación). Todo el acceso al backend desplegado en Vercel
// pasa por aquí: las vistas React ya no escriben la URL a mano.
// =====================================================================
const env = import.meta.env || {}

// URL del backend en la nube. Se puede cambiar con VITE_API_URL (archivo .env)
export const API_URL = (env.VITE_API_URL || 'https://eva01-full-stack2-eight.vercel.app').replace(/\/$/, '')

// fetch normal, pero anteponiendo la URL del backend: apiFetch('/api/productos')
export function apiFetch(ruta, opciones) {
  return fetch(API_URL + ruta, opciones)
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Llama al backend, devuelve el JSON y lanza Error con el mensaje del backend si falla
async function pedirJson(ruta, opciones) {
  const respuesta = await apiFetch(ruta, opciones)
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    datos = null
  }
  if (!respuesta.ok) {
    throw new Error((datos && datos.error) || 'Error ' + respuesta.status)
  }
  return datos
}

const conCuerpo = (metodo, cuerpo) => ({
  method: metodo,
  headers: JSON_HEADERS,
  body: JSON.stringify(cuerpo),
})

// ------------------------------ PRODUCTOS (CRUD) ------------------------------
export const productosApi = {
  listar: (filtros = {}) => {
    const qs = new URLSearchParams(filtros).toString()
    return pedirJson('/api/productos' + (qs ? '?' + qs : ''))
  },
  obtener: (id) => pedirJson('/api/productos/' + id),
  crear: (producto) => pedirJson('/api/productos', conCuerpo('POST', producto)),
  actualizar: (id, producto) => pedirJson('/api/productos/' + id, conCuerpo('PUT', producto)),
  eliminar: (id) => pedirJson('/api/productos/' + id, { method: 'DELETE' }),
  criticos: () => pedirJson('/api/productos/criticos'),
}

// ------------------------------ CATEGORÍAS ------------------------------
export const categoriasApi = {
  listar: () => pedirJson('/api/categorias'),
  crear: (nombre_categoria) => pedirJson('/api/categorias', conCuerpo('POST', { nombre_categoria })),
  actualizar: (id, nombre_categoria) =>
    pedirJson('/api/categorias/' + id, conCuerpo('PUT', { nombre_categoria })),
}

// ------------------------------ ÓRDENES / BOLETAS ------------------------------
export const ordenesApi = {
  listar: (idUsuario) => pedirJson('/api/ordenes' + (idUsuario ? '?id_usuario=' + idUsuario : '')),
  obtener: (id) => pedirJson('/api/ordenes/' + id),
  crear: (orden) => pedirJson('/api/ordenes', conCuerpo('POST', orden)),
  cambiarEstado: (id, estado) => pedirJson('/api/ordenes/' + id, conCuerpo('PUT', { estado })),
}

// ------------------------------ USUARIOS ------------------------------
export const usuariosApi = {
  listar: () => pedirJson('/api/usuarios'),
  obtener: (id) => pedirJson('/api/usuarios/' + id),
  crear: (usuario) => pedirJson('/api/usuarios', conCuerpo('POST', usuario)),
  actualizar: (id, usuario) => pedirJson('/api/usuarios/' + id, conCuerpo('PUT', usuario)),
}

// ------------------------------ DASHBOARD ------------------------------
export const dashboardApi = {
  resumen: () => pedirJson('/api/dashboard'),
}
