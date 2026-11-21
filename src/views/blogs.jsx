import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, API_URL } from '../services/api'

// Decide dónde está la imagen del blog
export const rutaImagenBlog = (img) => {
  if (!img) return '/img/fondoaz.jpg'
  // Imagen subida desde el formulario: vive en el backend
  if (img.startsWith('/uploads/')) return API_URL + '/api/v1' + img
  if (/^(https?:)?\/\//.test(img) || img.startsWith('/')) return img
  if (img.startsWith('img/')) return '/' + img
  return '/img/' + img
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  // Al cargar la página, pide la lista de blogs al backend
  useEffect(() => {
    let vigente = true
    apiFetch('/api/blogs')
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta de red no ok')
        return res.json()
      })
      .then((data) => {
        if (vigente) setBlogs(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.log('Error al traer los blogs:', err)
        if (vigente) setError(true)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="background min-vh-100">
      <h1 className="h1-blogs">Blogs </h1>

      {cargando && <p className="text-white">Cargando blogs...</p>}
      {error && <p className="text-danger">No se pudieron cargar los blogs.</p>}
      {!cargando && !error && blogs.length === 0 && (
        <p className="text-white">Aún no hay blogs publicados.</p>
      )}

      {blogs.map((blog) => {
        const id = blog.idBlog ?? blog.id_blog
        const resumen = blog.descripcionCorta || blog.descripcion_corta || ''

        return (
          <div className="card mb-3" style={{ maxWidth: '640px' }} key={id}>
            <div className="row g-0">
              <div className="col-md-4">
                <img
                  src={rutaImagenBlog(blog.imagen)}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/img/fondoaz.jpg'
                  }}
                  style={{ height: '100%', objectFit: 'cover' }}
                  className="img-fluid rounded-start"
                  alt={blog.titulo}
                />
              </div>
              <div className="col-md-8">
                <div className="card-body">
                  <h5 className="card-title">{blog.titulo}</h5>
                  <p className="card-text">{resumen}</p>
                  <Link
                    to={`/blog/${id}`}
                    className="btn btn-info"
                    style={{
                      background: 'linear-gradient(rgb(59, 67, 116), rgb(17, 17, 95))',
                      color: 'white',
                    }}
                  >
                    Detalles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <br />
    </div>
  )
}
