import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'


export default function DetalleBlog() {
  const [params] = useSearchParams()
  const idBlog = params.get('id')

  const [blog, setBlog] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!idBlog) return

    let vigente = true
    fetch('/api/blogs/' + idBlog)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('Respuesta de red no ok')
        return respuesta.json()
      })
      .then((datos) => {
        if (vigente) setBlog(datos)
      })
      .catch((err) => {
        if (!vigente) return
        console.log('Error al traer el blog:', err)
        const respaldo = blogsPorDefecto.find((b) => String(b.id_blog) === idBlog)
        if (respaldo) setBlog(respaldo)
        else setError(true)
      })

    return () => {
      vigente = false
    }
  }, [idBlog])

  let titulo = 'Cargando blog...'
  let contenido = null
  if (!idBlog) {
    titulo = 'Blog no encontrado'
    contenido = <p className="text-danger">No se proporcionó un ID de artículo válido.</p>
  } else if (error) {
    titulo = 'Error al cargar el blog'
    contenido = (
      <p className="text-danger">El artículo solicitado no existe o no se pudo cargar.</p>
    )
  } else if (blog) {
    titulo = blog.titulo || 'Sin título'
  }

  let fecha = ''
  if (blog && blog.fecha_publicacion) {
    const fechaObj = new Date(blog.fecha_publicacion)
    if (!isNaN(fechaObj)) {
      fecha =
        'Publicado el ' +
        fechaObj.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 bg-white p-4 rounded shadow-sm">
            <h1 id="Titulo" className="mb-2">{titulo}</h1>
            <p id="Fecha" className="text-muted small mb-3">{fecha}</p>
            {blog && (
              <img
                id="Imagen"
                src={rutaImagenBlog(blog.imagen)}
                alt={blog.titulo || 'Imagen del blog'}
                className="img-fluid rounded my-3 w-100"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            )}
            {blog ? (
              <div
                id="Contenido"
                className="mt-4 lh-lg fs-5"
                dangerouslySetInnerHTML={{
                  __html: blog.contenido_html || blog.contenidoHtml || blog.resumen || '',
                }}
              />
            ) : (
              <div id="Contenido" className="mt-4 lh-lg fs-5">{contenido}</div>
            )}
            <hr className="my-4" />
            <Link
              to="/blogs"
              className="btn btn-outline-secondary"
              style={{
                background: 'linear-gradient(rgb(59, 67, 116), rgb(17, 17, 95))',
                color: 'white',
              }}
            >
              ← Volver a Blogs
            </Link>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}
