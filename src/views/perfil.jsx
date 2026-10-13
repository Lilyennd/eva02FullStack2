import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usuariosApi } from '../services/api'
import { esAdmin, useUsuario } from '../services/sesion'

export default function Perfil() {
  const sesion = useUsuario()
  const admin = esAdmin(sesion)
  const id = sesion ? sesion.id_usuario : null
  const [usuario, setUsuario] = useState(null)
  const [error, setError] = useState(id ? '' : 'Debes iniciar sesión.')

  useEffect(() => {
    if (!id) return
    let vigente = true
    usuariosApi
      .obtener(id)
      .then((u) => vigente && setUsuario(u))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [id])

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <div className="card shadow border-0 rounded-4 p-4 col-md-8 mx-auto">
          <h3 className="fw-bold mb-3">Mi perfil</h3>
          {error && <p className="text-danger">{error}</p>}
          {usuario && (
            <>
              <p className="mb-1"><b>Nombre:</b> {usuario.nombre} {usuario.apellidos}</p>
              <p className="mb-1"><b>RUN:</b> {usuario.run}</p>
              <p className="mb-1"><b>Correo:</b> {usuario.correo}</p>
              <p className="mb-3"><b>Teléfono:</b> {usuario.telefono || '—'}</p>
              <div className="d-flex gap-2">
                <Link to={`/editarUsuario?id=${usuario.id_usuario}`} className="btn btn-warning">Editar datos</Link>
                {!admin && (
                  <Link to={`/historialCompras?id=${usuario.id_usuario}`} className="btn btn-outline-dark">Mis compras</Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}