import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { blogsApi, subirImagen } from '../services/api'

export default function NuevoBlog() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState({
    titulo: '',
    descripcion_corta: '',
    descripcion_larga: '',
  })
  const [archivo, setArchivo] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()

    if (datos.titulo.trim() === '') {
      alert('El título del blog es obligatorio.')
      return
    }
    if (datos.descripcion_corta.trim() === '') {
      alert('El resumen (descripción corta) es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      let rutaImagen = null
      if (archivo) {
        rutaImagen = await subirImagen('blogs', archivo)
      }

      const nuevoBlog = {
        titulo: datos.titulo.trim(),
        descripcionCorta: datos.descripcion_corta.trim(),
        imagen: rutaImagen,
        detalle: {
          descripcionLarga: datos.descripcion_larga.trim()
            ? `<p>${datos.descripcion_larga.trim().replace(/\n/g, '</p><p>')}</p>`
            : `<p>${datos.descripcion_corta.trim()}</p>`,
        },
      }

      await blogsApi.crear(nuevoBlog)
      alert('¡Blog creado con éxito!')
      navigate('/gestionBlogs')
    } catch (err) {
      alert('Error al crear: ' + (err.message || 'Problema en el servidor'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container">
        <div className="row justify-content-center py-5">
          <div className="col-md-9 col-lg-7">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title text-center mb-4 fw-bold">Nuevo Blog</h3>
                <form id="formBlog" noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">Título del Blog *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      value={datos.titulo}
                      onChange={handleChange}
                      placeholder="Ej: Consejos para el cuidado de tus joyas"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="descripcion_corta" className="form-label">Resumen (Descripción corta) *</label>
                    <textarea
                      className="form-control"
                      id="descripcion_corta"
                      rows="3"
                      value={datos.descripcion_corta}
                      onChange={handleChange}
                      placeholder="Resumen que aparecerá en la tarjeta..."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="descripcion_larga" className="form-label">Contenido completo</label>
                    <textarea
                      className="form-control"
                      id="descripcion_larga"
                      rows="5"
                      value={datos.descripcion_larga}
                      onChange={handleChange}
                      placeholder="Texto completo del artículo..."
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="imagen" className="form-label">Imagen del Blog</label>
                    <input
                      type="file"
                      className="form-control"
                      id="imagen"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setArchivo(e.target.files[0] || null)}
                    />
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-dark flex-fill py-2" disabled={guardando}>
                      {guardando ? 'Guardando...' : 'Guardar blog'}
                    </button>
                    <Link to="/gestionBlogs" className="btn btn-outline-secondary flex-fill py-2 text-center">
                      Cancelar
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}