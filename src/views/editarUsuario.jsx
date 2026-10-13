import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { esAdmin, guardarUsuario, useUsuario } from '../services/sesion'

export default function EditarUsuario() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const idUsuario = params.get('id')
  const avisado = useRef(false)
  const sesion = useUsuario()


  const volverA = esAdmin(sesion) ? '/listarUsuarios' : '/perfil'

  const [datos, setDatos] = useState({ run: '', nombre: '', apellidos: '', correo: '' })
  const [otros, setOtros] = useState({
    telefono: null, direccion: null, id_region: null, id_comuna: null, id_rol: null,
  })

  useEffect(() => {
    if (!idUsuario) {
      if (!avisado.current) {
        avisado.current = true
        alert('No se especificó un usuario para editar.')
      }
      navigate('/perfil')
      return
    }

    let vigente = true
    apiFetch(`/api/usuarios/${idUsuario}`)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('No se pudo encontrar el usuario.')
        return respuesta.json()
      })
      .then((usuario) => {
        if (!vigente) return
        setDatos({
          run: usuario.run,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          correo: usuario.correo,
        })
        setOtros({
          telefono: usuario.telefono ?? null,
          direccion: usuario.direccion ?? null,
          id_region: usuario.id_region ?? null,
          id_comuna: usuario.id_comuna ?? null,
          id_rol: usuario.id_rol ?? null,
        })
      })
      .catch((error) => {
        if (!vigente) return
        console.log('Error al cargar:', error)
        alert('No se pudieron cargar los datos del usuario.')
        navigate('/perfil')
      })

    return () => {
      vigente = false
    }
  }, [idUsuario, navigate])

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const cuerpo = {
      run: datos.run.trim(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim(),
      ...otros, 
    }

    apiFetch(`/api/usuarios/${idUsuario}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
      .then((respuesta) => {
        if (respuesta.ok) {
          if (sesion && String(sesion.id_usuario) === String(idUsuario)) {
            guardarUsuario({
              ...sesion,
              nombre: cuerpo.nombre,
              apellidos: cuerpo.apellidos,
              correo: cuerpo.correo,
            })
          }
          alert('¡Usuario actualizado con éxito!')
          navigate(volverA)
        } else {
          return respuesta.json().then((data) => {
            alert(data.error || 'No se pudo actualizar el usuario.')
          })
        }
      })
      .catch((error) => {
        console.log('Error de red:', error)
        alert('Error al conectar con el servidor.')
      })
  }

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7">
            <div className="card shadow border-0 rounded-4 p-4">
              <h3 className="text-center mb-4 fw-bold">Editar Usuario</h3>
              <div id="mensajeUsuario"></div>
              <form id="formEditarUsuario" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">RUN</label>
                  <input type="text" className="form-control" id="run" maxLength={9} required
                    value={datos.run} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <input type="text" className="form-control" id="nombre" required
                    value={datos.nombre} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Apellidos</label>
                  <input type="text" className="form-control" id="apellidos" required
                    value={datos.apellidos} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input type="email" className="form-control" id="correo" required
                    value={datos.correo} onChange={handleChange} />
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-warning flex-fill fw-bold">Guardar Cambios</button>
                  <Link to={volverA} className="btn btn-outline-secondary flex-fill">Cancelar</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}