import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const blogsPorDefecto = [
  {
    id_blog: 1,
    titulo: '💎 ¿Joyas en las uñas? La nueva tendencia de lujo de 2026',
    resumen:
      'Diamantes, piedras preciosas y detalles de alta joyería están dejando de ser exclusivos de anillos y collares para convertirse también en protagonistas de la manicura. Descubre cómo esta llamativa tendencia está uniendo el mundo de la belleza con el lujo y la joyería.',
    imagen: 'img/diamantes-para-uñas.webp',
  },
  {
    id_blog: 2,
    titulo: '🐶💎 ¿Joyas para tu mejor amigo? La nueva tendencia de collares con diamantes',
    resumen:
      'El lujo también está llegando al mundo de las mascotas. Collares decorados con cristales, piedras preciosas y detalles inspirados en la alta joyería se están convirtiendo en un accesorio llamativo para quienes quieren que sus perros luzcan con estilo.',
    imagen: 'img/diamantes-para-uñas.webp',
  },
]


const rutaImagen = (img) =>
  !img ? '' : /^(https?:)?\/\//.test(img) || img.startsWith('/') ? img : `/${img}`

export default function Blogs() {
  const [blogs, setBlogs] = useState(blogsPorDefecto)

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBlogs(data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="background min-vh-100">
      <h1 className="h1-blogs">Blogs </h1>

      {blogs.map((blog) => (
        <div className="card mb-3" style={{ maxWidth: '640px' }} key={blog.id_blog}>
          <div className="row g-0">
            <div className="col-md-4">
              <img
                src={rutaImagen(blog.imagen)}
                style={{ height: '100%', objectFit: 'cover' }}
                className="img-fluid rounded-start"
                alt={blog.titulo}
              />
            </div>
            <div className="col-md-8">
              <div className="card-body">
                <h5 className="card-title">{blog.titulo}</h5>
                <p className="card-text">{blog.resumen}</p>
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