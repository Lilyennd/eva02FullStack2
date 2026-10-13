import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../services/api'

const ROLES = {
  1: { textoRol: 'Comprador', claseBadge: 'bg-secondary' },
  2: { textoRol: 'Administrador / Vendedor', claseBadge: 'bg-dark' },
}

function rolDelCorreo(correo) {
  const c = (correo || '').trim().toLowerCase()
  if (c.endsWith('@duocuc.cl') || c.endsWith('@profesor.duoc.cl')) return 2
  return 1
}

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch('/api/usuarios')
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('Error del servidor')
        return respuesta.json()
      })
      .then(setUsuarios)
      .catch((err) => {
        console.log('Error al traer los usuarios:', err)
        setError(true)
      })
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0 herotitulo" style={{ color: 'white', fontSize: 'xx-large' }}>
            Lista de Usuarios Registrados
          </h1>
          <Link to="/crearUsuario" className="btn btn-light fw-bold">Nuevo usuario</Link>
        </div>
        <div className="card shadow border-0 rounded-4 p-4">
          <div className="table-responsive">
            <table className="table table-striped align-middle">
              <thead>
                <tr>
                  <th scope="col">RUN</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Apellidos</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody id="cuerpoTablaUsuarios">
                {error && (
                  <tr>
                    <td colSpan={6} className="text-center text-danger">
                      No se pudieron cargar los usuarios.
                    </td>
                  </tr>
                )}
                {!error && usuarios && usuarios.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center">No hay usuarios registrados.</td>
                  </tr>
                )}
                {!error &&
                  usuarios &&
                  usuarios.map((user) => {
                    const { textoRol, claseBadge } = ROLES[rolDelCorreo(user.correo)]
                    return (
                      <tr key={user.id_usuario}>
                        <td>{user.run}</td>
                        <td>{user.nombre}</td>
                        <td>{user.apellidos}</td>
                        <td>{user.correo}</td>
                        <td><span className={`badge ${claseBadge}`}>{textoRol}</span></td>
                        <td>
                          <Link
                            to={`/editarUsuario?id=${user.id_usuario}`}
                            className="btn btn-warning btn-sm fw-bold"
                          >
                            Editar
                          </Link>
                          <Link
                            to={`/historialCompras?id=${user.id_usuario}`}
                            className="btn btn-outline-dark btn-sm fw-bold ms-2"
                          >
                            Historial
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}