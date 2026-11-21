import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch, blogsApi, subirImagen } from '../services/api'

export default function ModificarBlog() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const idUrl = params.get('id') || ''

  const [listaBlogs, setListaBlogs] = useState([])
  const [idSeleccionado, setIdSeleccionado] = useState(idUrl)
  const [datos, setDatos] = useState({
    titulo: '',
    descripcion_corta: '',
    descripcion_larga: '',
    imagen: '',
  })
  const [archivo, setArchivo] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargarDetalle = (id) => {
    if (!id) return
    apiFetch('/api/blogs/' + id)
      .then((res) => res.json())
      .then((b) => {
        const corta = b.descripcionCorta || b.descripcion_corta || ''
        const larga =
          b.descripcionLarga ||
          b.descripcion_larga ||
          b.detalle?.descripcionLarga ||
          b.detalle?.descripcion_larga ||
          ''

        setDatos({
          titulo: b.titulo || '',
          descripcion_corta: corta,
          descripcion_larga: larga.replace(/<\/?p>/g, '\n').trim(),
          imagen: b.imagen || '',
        })
      })
      .catch(() => alert('Error al cargar el detalle del blog.'))
  }

  useEffect(() => {
    apiFetch('/api/blogs')
      .then((res) => res.json())
      .then((lista) => {
        setListaBlogs(Array.isArray(lista) ? lista : [])
        if (idUrl) cargarDetalle(idUrl)
      })
      .catch(() => alert('Error al cargar los blogs desde la base de datos.'))
  }, [idUrl])

  const handleSeleccion = (e) => {
    const id = e.target.value
    setIdSeleccionado(id)
    cargarDetalle(id)
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()

    if (!idSeleccionado) {
      alert('Por favor, selecciona un blog primero.')
      return
    }

    setGuardando(true)
    try {
      let rutaImagen = datos.imagen
      if (archivo) {
        rutaImagen = await subirImagen('blogs', archivo)
      }

      const corta = datos.descripcion_corta.trim()
      const htmlLargo = datos.descripcion_larga.trim()
        ? `<p>${datos.descripcion_larga.trim().replace(/\n+/g, '</p><p>')}</p>`
        : `<p>${corta}</p>`

      const paqueteDatos = {
        titulo: datos.titulo.trim(),
        descripcionCorta: corta,
        descripcion_corta: corta,
        descripcionLarga: htmlLargo,
        descripcion_larga: htmlLargo,
        imagen: rutaImagen || null,
        detalle: {
          descripcionLarga: htmlLargo,
          descripcion_larga: htmlLargo,
        },
      }

      await blogsApi.actualizar(idSeleccionado, paqueteDatos)
      alert('El blog se actualizó correctamente')
      navigate('/gestionBlogs')
    } catch (err) {
      alert('Hubo un problema al guardar: ' + (err.message || 'Error de servidor'))
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
                <h3 className="card-title text-center mb-4 fw-bold">Modificar Blog</h3>
                <form id="formBlog" noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="select_blog" className="form-label">Seleccionar Blog a Modificar</label>
                    <select
                      className="form-select bg-light fw-bold"
                      id="select_blog"
                      value={idSeleccionado}
                      onChange={handleSeleccion}
                      required
                    >
                      <option value="" disabled>Elige un blog...</option>
                      {listaBlogs.map((b) => {
                        const id = b.idBlog ?? b.id_blog
                        return (
                          <option key={id} value={id}>
                            {id + ' - ' + b.titulo}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="titulo" className="form-label">Título *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      value={datos.titulo}
                      onChange={handleChange}
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
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="imagen" className="form-label">Cambiar Imagen (opcional)</label>
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
                      {guardando ? 'Guardando...' : 'Modificar Blog'}
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