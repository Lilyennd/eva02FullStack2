import { useCallback, useEffect, useState } from 'react'
import { categoriasApi } from '../services/api'

// Nueva categoría / Editar categoría: GET, POST y PUT /api/categorias
export default function AdminCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  const cargar = useCallback(() => {
    categoriasApi
      .listar()
      .then(setCategorias)
      .catch((err) => setMensaje({ tipo: 'danger', texto: err.message }))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const limpiar = () => {
    setNombre('')
    setEditandoId(null)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (nombre.trim() === '') {
      setMensaje({ tipo: 'danger', texto: 'El nombre de la categoría es obligatorio.' })
      return
    }
    try {
      if (editandoId) {
        await categoriasApi.actualizar(editandoId, nombre.trim())
        setMensaje({ tipo: 'success', texto: 'Categoría actualizada.' })
      } else {
        await categoriasApi.crear(nombre.trim())
        setMensaje({ tipo: 'success', texto: 'Categoría creada.' })
      }
      limpiar()
      cargar()
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message })
    }
  }

  const editar = (c) => {
    setEditandoId(c.id_categoria)
    setNombre(c.nombre_categoria)
    setMensaje({ tipo: '', texto: '' })
  }

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Categorías</h1>
        <div className="card shadow border-0 rounded-4 p-4">
          {mensaje.texto && <div className={`alert alert-${mensaje.tipo}`} id="mensajeCategoria">{mensaje.texto}</div>}

          <form className="row g-2 mb-4" onSubmit={guardar} id="formCategoria">
            <div className="col-md-8">
              <input id="nombre_categoria" className="form-control" maxLength={50}
                placeholder={editandoId ? 'Nuevo nombre' : 'Nombre de la nueva categoría'}
                value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button type="submit" className="btn btn-dark flex-fill">
                {editandoId ? 'Actualizar' : 'Crear'}
              </button>
              {editandoId && (
                <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>Cancelar</button>
              )}
            </div>
          </form>

          <ul className="list-group" id="listaCategorias">
            {categorias.map((c) => (
              <li key={c.id_categoria} className="list-group-item d-flex justify-content-between align-items-center">
                {c.nombre_categoria}
                <button className="btn btn-sm btn-warning" onClick={() => editar(c)}>Editar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
