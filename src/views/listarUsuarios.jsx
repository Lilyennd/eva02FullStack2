import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


function rolDeUsuario(user) {
  const correo = user.correo ? user.correo.toLowerCase() : ''
  if (correo.endsWith('@profesor.duoc.cl') || correo.endsWith('@duocuc.cl') || user.id_rol === 1) {
    return { textoRol: 'Administrador / Vendedor', claseBadge: 'bg-dark' }
  }
  return { textoRol: 'Comprador', claseBadge: 'bg-secondary' }
}

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/usuarios')
      .then((respuesta) => respuesta.json())
      .then(setUsuarios)
      .catch((err) => {
        console.log('Error al traer los usuarios:', err)
        setError(true)
      })
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <h1
          className="text-center mb-4 ; herotitulo"
          style={{ color: 'white', fontSize: 'xx-large' }}
        >
          Lista de Usuarios Registrados
        </h1>
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
                    const { textoRol, claseBadge } = rolDeUsuario(user)
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