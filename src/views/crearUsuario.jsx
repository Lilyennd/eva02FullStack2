import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function determinarRol(correo) {
  const c = correo.trim().toLowerCase()
  if (c.endsWith('@profesor.duoc.cl')) return 1
  if (c.endsWith('@duocuc.cl')) return 1
  if (c.endsWith('@gmail.com')) return 2
  return null
}

function validarRun(run) {
  return /^[0-9]{6,8}[0-9kK]$/.test(run.trim())
}

const datosVacios = {
  run: '', nombre: '', apellidos: '', correo: '', password: '', telefono: '', direccion: '',
}

export default function CrearUsuario() {
  const navigate = useNavigate()

  const [datos, setDatos] = useState(datosVacios)
  const [regiones, setRegiones] = useState([])
  const [comunas, setComunas] = useState([])
  const [region, setRegion] = useState(null)
  const [comuna, setComuna] = useState(null)
  const [errorRun, setErrorRun] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')

  useEffect(() => {
    fetch('/api/regiones')
      .then((res) => res.json())
      .then(setRegiones)
      .catch((error) => console.error('Error cargando regiones:', error))
  }, [])

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
  }

  const seleccionarRegion = (r) => {
    setRegion(r)
    setComuna(null)
    setComunas([])
    fetch(`/api/comunas?regionId=${r.id_region}`)
      .then((res) => res.json())
      .then(setComunas)
      .catch((error) => console.error('Error cargando comunas:', error))
  }

  const validarCorreoAlSalir = () => {
    setErrorCorreo(
      determinarRol(datos.correo) === null
        ? 'Solo se permiten correos @gmail.com, @duocuc.cl o @profesor.duoc.cl.'
        : ''
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const run = datos.run.trim()
    const correo = datos.correo.trim()

    if (!validarRun(run)) {
      setErrorRun('RUN inválido. Debe tener entre 7 y 9 caracteres, sin puntos ni guion.')
      return
    }
    setErrorRun('')

    const rol = determinarRol(correo)
    if (rol === null) {
      setErrorCorreo('Correo no permitido. Usa @gmail.com, @duocuc.cl o @profesor.duoc.cl.')
      return
    }

    if (!region || !comuna) {
      alert('Selecciona región y comuna.')
      return
    }

    const usuario = {
      run,
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      correo,
      password: datos.password,
      telefono: datos.telefono.trim() || null,
      id_rol: rol,
      id_region: Number(region.id_region),
      id_comuna: Number(comuna.id_comuna),
      direccion: datos.direccion.trim(),
    }

    try {
      const respuesta = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      })
      const data = await respuesta.json()

      if (respuesta.ok) {
        alert('¡Usuario registrado con éxito!')
        navigate('/listarUsuarios')
      } else {
        alert(data.error || 'Error al registrar')
      }
    } catch (error) {
      console.error('Error de red:', error)
      alert('No se pudo conectar con el servidor.')
    }
  }

  return (
    <div className="bg-light background min-vh-100">
        <div className="container">
          <div className="row justify-content-center align-items-center min-vh-100 py-4">
            <div className="col-md-7 col-lg-6">
              <div className="card shadow border-0 rounded-4">
                <div className="card-body p-4 p-md-5">
                  <h3 className="card-title text-center mb-4 fw-bold">
                    Crear Nuevo Usuario
                  </h3>

                  <form id="formRegistroUsuario" onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="run" className="form-label">RUN</label>
                      <input
                        type="text"
                        className={`form-control${errorRun ? ' is-invalid' : ''}`}
                        id="run"
                        placeholder="Ej: 19011022K (sin puntos ni guion)"
                        maxLength={9}
                        required
                        value={datos.run}
                        onChange={handleChange}
                      />
                      <div className="invalid-feedback" id="error-run">{errorRun}</div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <input
                          type="text"
                          className="form-control"
                          id="nombre"
                          placeholder="Nombre"
                          maxLength={50}
                          required
                          value={datos.nombre}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="apellidos" className="form-label">Apellidos</label>
                        <input
                          type="text"
                          className="form-control"
                          id="apellidos"
                          placeholder="Apellidos"
                          maxLength={100}
                          required
                          value={datos.apellidos}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                      <input
                        type="email"
                        className="form-control"
                        id="correo"
                        placeholder="nombre@dominio.cl"
                        maxLength={100}
                        required
                        value={datos.correo}
                        onChange={handleChange}
                        onBlur={validarCorreoAlSalir}
                      />
                      <div className={`form-text${errorCorreo ? ' text-danger' : ''}`} id="error-correo">
                        {errorCorreo}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Contraseña</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="••••••••"
                        required
                        value={datos.password}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="telefono" className="form-label">Teléfono (opcional)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="telefono"
                        placeholder="+56912345678"
                        value={datos.telefono}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label d-block">Región</label>
                      <div className="dropdown">
                        <button
                          className="btn btn-outline-secondary dropdown-toggle w-100 text-start d-flex justify-content-between align-items-center"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          id="btnRegion"
                        >
                          {region ? region.nombre_region : 'Seleccionar Región'}
                        </button>
                        <ul className="dropdown-menu w-100" id="listaRegion">
                          {regiones.map((r) => (
                            <li key={r.id_region}>
                              <a
                                className="dropdown-item"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  seleccionarRegion(r)
                                }}
                              >
                                {r.nombre_region}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label d-block">Comuna</label>
                      <div className="dropdown">
                        <button
                          className="btn btn-outline-secondary dropdown-toggle w-100 text-start d-flex justify-content-between align-items-center"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          id="btnComuna"
                          disabled={!region}
                        >
                          {!region
                            ? 'Selecciona una región primero'
                            : comuna
                              ? comuna.nombre_comuna
                              : 'Seleccionar Comuna'}
                        </button>
                        <ul className="dropdown-menu w-100" id="listaComuna">
                          {comunas.map((c) => (
                            <li key={c.id_comuna}>
                              <a
                                className="dropdown-item"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setComuna(c)
                                }}
                              >
                                {c.nombre_comuna}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="direccion" className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        id="direccion"
                        placeholder="Calle, número, depto"
                        maxLength={300}
                        required
                        value={datos.direccion}
                        onChange={handleChange}
                      />
                    </div>

                      <button
                        type="submit"
                        className="btn btn-success w-100 py-2 mt-3"
                        style={{ backgroundColor: 'rgb(31, 31, 88)' }}
                      >
                        Registrar Usuario
                      </button>
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
