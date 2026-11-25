// =====================================================================
// Capa de datos del frontend. Conexión con el backend en Spring Boot (/api/v1)
// Incluye envío automático del token JWT de autenticación.
// =====================================================================
const env = import.meta.env || {}

// Backend en el VPS 
//export const API_URL = (env.VITE_API_URL || 'http://186.64.113.33:8008').replace(/\/$/, '')
// Backend local 
 export const API_URL = (env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')

// fetch automático anteponiendo API_URL, agregando Authorization Bearer y versionando a /api/v1/
export function apiFetch(ruta, opciones = {}) {
  const token = localStorage.getItem('token')
  const headers = { ...(opciones.headers || {}) }

  if (token) {
    headers['Authorization'] = 'Bearer ' + token
  }

  // Versionado: reemplaza /api/ por /api/v1/ si aún no lo tiene
  const rutaVersionada = ruta.startsWith('/api/v1')
    ? ruta
    : ruta.replace(/^\/api\/?/, '/api/v1/')

  return fetch(API_URL + rutaVersionada, { ...opciones, headers })
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

// ------------------------------ IMÁGENES ------------------------------

export async function subirImagen(tipo, archivo) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  const datos = await pedirJson('/api/imagenes/' + tipo, { method: 'POST', body: formData })
  return datos.imagen
}


export function urlImagen(img, tipo) {
  if (!img) return '/img/fondoaz.jpg'
  if (img.startsWith('/uploads/')) return API_URL + '/api/v1' + img
  return `/img/${tipo}/${img}`
}

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
  ofertas: () => pedirJson('/api/productos/ofertas'),
}

// ------------------------------ CATEGORÍAS ------------------------------
export const categoriasApi = {
  listar: () => pedirJson('/api/categorias'),
  obtener: (id) => pedirJson('/api/categorias/' + id),
  crear: (nombre_categoria) => pedirJson('/api/categorias', conCuerpo('POST', { nombre_categoria })),
  actualizar: (id, nombre_categoria) =>
    pedirJson('/api/categorias/' + id, conCuerpo('PUT', { nombre_categoria })),
  eliminar: (id) => pedirJson('/api/categorias/' + id, { method: 'DELETE' }),
}

// ------------------------------ ÓRDENES / BOLETAS ------------------------------
export const ordenesApi = {
  listar: (idUsuario, { desde, hasta } = {}) => {
    const qs = new URLSearchParams()
    if (idUsuario) qs.set('id_usuario', idUsuario)
    if (desde) qs.set('desde', desde)
    if (hasta) qs.set('hasta', hasta)
    const texto = qs.toString()
    return pedirJson('/api/ordenes' + (texto ? '?' + texto : ''))
  },
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
  eliminar: (id) => pedirJson('/api/usuarios/' + id, { method: 'DELETE' }),
}

// ------------------------------ BLOGS ------------------------------
export const blogsApi = {
  obtener: (id) => pedirJson('/api/blogs/' + id),
  crear: (blog) => pedirJson('/api/blogs', conCuerpo('POST', blog)),
  actualizar: (id, blog) => pedirJson('/api/blogs/' + id, conCuerpo('PUT', blog)),
}

// ------------------------------ DASHBOARD ------------------------------
export const dashboardApi = {
  resumen: () => pedirJson('/api/dashboard'),
}

// ------------------------------ CONTACTOS ------------------------------
export const contactoApi = {
  listar: () => pedirJson('/api/contacto'),
  enviar: (mensaje) => pedirJson('/api/contacto', conCuerpo('POST', mensaje)),
  marcarLeido: (id) => pedirJson('/api/contacto/' + id + '/leido', { method: 'PUT' }),
  eliminar: (id) => pedirJson('/api/contacto/' + id, { method: 'DELETE' }),
}