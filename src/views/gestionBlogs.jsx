import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { rutaImagenBlog } from './blogs'

export default function GestionBlogs() {
  const [blogs, setBlogs] = useState([])
  const [error, setError] = useState(false)

  const cargarBlogs = () => {
    apiFetch('/api/blogs')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar')
        return res.json()
      })
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : [])
        setError(false)
      })
      .catch((err) => {
        console.log('Error al traer los blogs:', err)
        setError(true)
      })
  }

  useEffect(() => {
    cargarBlogs()
  }, [])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este blog?')) return
    try {
      const res = await apiFetch('/api/blogs/' + id, { method: 'DELETE' })
      if (res.ok) {
        alert('Blog eliminado correctamente.')
        cargarBlogs()
      } else {
        alert('No se pudo eliminar el blog.')
      }
    } catch {
      alert('Error de conexión con el servidor.')
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-center mb-0 herotitulo" style={{ color: '#f4f5fa' }}>
            Gestión de Blogs
          </h1>
          <Link
            to="/nuevoBlog"
            className="btn btn-dark"
            style={{
              backgroundColor: '#f4f5fa',
              borderColor: '#f5f5fa',
              color: 'rgb(24, 24, 68)',
              fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
            }}
          >
            Agregar Nuevo Blog
          </Link>
        </div>

        <div className="row g-4">
          {error && <p className="text-danger">No se pudieron cargar los blogs.</p>}
          {!error && blogs.length === 0 && (
            <p className="text-white">No hay blogs publicados actualmente.</p>
          )}
          {!error &&
            blogs.map((blog) => {
              const id = blog.idBlog ?? blog.id_blog
              const resumen = blog.descripcionCorta || blog.descripcion_corta || ''

              return (
                <div className="col-12 col-sm-6 col-lg-4" key={id}>
                  <div className="card h-100">
                    <img
                      src={rutaImagenBlog(blog.imagen)}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/img/fondoaz.jpg'
                      }}
                      className="card-img-top"
                      alt={blog.titulo}
                      style={{ height: '220px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{blog.titulo}</h5>
                      <p className="card-text text-muted">{resumen}</p>
                      <div className="d-flex gap-2 mt-auto">
                        <Link
                          to={`/modificarBlog?id=${id}`}
                          className="btn btn-outline-dark flex-fill textbasico"
                          style={{ backgroundColor: '#263869', borderColor: '#3f4d7a', color: 'white' }}
                        >
                          Modificar
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleEliminar(id)}
                          className="btn btn-outline-danger"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <br />
    </div>
  )
}