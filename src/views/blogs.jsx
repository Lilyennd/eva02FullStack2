import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const rutaImagenBlog = (img) => {
  if (!img) return '/img/fondoaz.jpg'
  if (/^(https?:)?\/\//.test(img) || img.startsWith('/')) return img
  if (img.startsWith('img/')) return '/' + img
  return '/img/' + img
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let vigente = true
    fetch('/api/blogs')
      .then((res) => {
        if (!res.ok) throw new Error('Respuesta de red no ok')
        return res.json()
      })
      .then((data) => {
        if (vigente) setBlogs(data)
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

      {blogs.map((blog) => (
        <div className="card mb-3" style={{ maxWidth: '640px' }} key={blog.id_blog}>
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
                {/* La BD devuelve descripcion_corta (antes se leía "resumen") */}
                <p className="card-text">{blog.descripcion_corta}</p>
                <Link
                  to={`/detalleBlog?id=${blog.id_blog}`}
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
      ))}
      <br />
    </div>
  )
}