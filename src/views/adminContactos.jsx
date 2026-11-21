import { useCallback, useEffect, useState } from 'react'
import { contactoApi } from '../services/api'

const FILTROS_ESTADO = ['Todos', 'Sin leer', 'Leídos']

const obtenerId = (c) => c.id_contacto ?? c.idContacto
const obtenerFecha = (c) => c.fecha_envio ?? c.fechaEnvio
const obtenerTexto = (c) => c.comentario ?? c.mensaje ?? ''

export function filtrarContactos(contactos, estado, texto) {
  const t = texto.trim().toLowerCase()
  return contactos.filter((c) => {
    const leido = Boolean(c.leido)
    const okEstado =
      estado === 'Todos' ||
      (estado === 'Sin leer' && !leido) ||
      (estado === 'Leídos' && leido)

    const contenido = `${c.nombre || ''} ${c.correo || ''} ${obtenerTexto(c)}`.toLowerCase()
    const okTexto = !t || contenido.includes(t)
    return okEstado && okTexto
  })
}

export default function AdminContactos() {
  const [contactos, setContactos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [texto, setTexto] = useState('')
  const [procesandoId, setProcesandoId] = useState(null)

  const cargar = useCallback(() => {
    setCargando(true)
    contactoApi
      .listar()
      .then((lista) => {
        setContactos(Array.isArray(lista) ? lista : [])
        setError('')
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar los mensajes.'))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleMarcarLeido = async (contacto) => {
    const id = obtenerId(contacto)
    setMensaje({ tipo: '', texto: '' })
    setProcesandoId(id)
    try {
      const actualizado = await contactoApi.marcarLeido(id)
      const nuevoEstado =
        actualizado && actualizado.leido !== undefined ? Boolean(actualizado.leido) : true

      setContactos((prev) =>
        prev.map((c) => (obtenerId(c) === id ? { ...c, leido: nuevoEstado } : c))
      )
      setMensaje({
        tipo: 'success',
        texto: nuevoEstado ? 'Mensaje marcado como leído.' : 'Mensaje marcado como no leído.',
      })
    } catch (err) {
      setMensaje({
        tipo: 'danger',
        texto: err.message || 'No se pudo actualizar el estado del mensaje.',
      })
    } finally {
      setProcesandoId(null)
    }
  }

  const handleEliminar = async (contacto) => {
    const id = obtenerId(contacto)
    if (!window.confirm(`¿Eliminar permanentemente el mensaje de "${contacto.nombre}"?`)) return

    setMensaje({ tipo: '', texto: '' })
    setProcesandoId(id)
    try {
      await contactoApi.eliminar(id)
      setContactos((prev) => prev.filter((c) => obtenerId(c) !== id))
      setMensaje({ tipo: 'success', texto: 'Mensaje eliminado correctamente.' })
    } catch (err) {
      setMensaje({
        tipo: 'danger',
        texto: err.message || 'No se pudo eliminar el mensaje.',
      })
    } finally {
      setProcesandoId(null)
    }
  }

  const sinLeer = contactos.filter((c) => !c.leido).length
  const visibles = filtrarContactos(contactos, filtroEstado, texto)

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <h1 className="mb-0 herotitulo" style={{ color: 'white' }}>
            Bandeja de Contacto
          </h1>
          <span className="badge bg-warning text-dark fs-6 px-3 py-2">
            Sin leer: {sinLeer}
          </span>
        </div>

        <div className="card shadow border-0 rounded-4 p-4">
          {mensaje.texto && (
            <div className={`alert alert-${mensaje.tipo} alert-dismissible fade show`} role="alert">
              {mensaje.texto}
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={() => setMensaje({ tipo: '', texto: '' })}
              />
            </div>
          )}

          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <select
                className="form-select"
                id="filtroEstadoContacto"
                aria-label="Filtrar mensajes por estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                {FILTROS_ESTADO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <input
                className="form-control"
                id="filtroTextoContacto"
                placeholder="Buscar por nombre, correo o contenido del mensaje"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-danger text-center mb-0">
              No se pudieron cargar los mensajes: {error}
            </p>
          )}

          {!error && cargando && <p className="text-center mb-0">Cargando mensajes...</p>}

          {!error && !cargando && visibles.length === 0 && (
            <p className="text-center text-muted mb-0">No hay mensajes para mostrar.</p>
          )}

          {!error && !cargando && visibles.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Remitente</th>
                    <th>Mensaje</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((c) => {
                    const id = obtenerId(c)
                    const leido = Boolean(c.leido)
                    const fecha = obtenerFecha(c)
                    return (
                      <tr key={id} className={!leido ? 'table-warning' : ''}>
                        <td>
                          {leido ? (
                            <span className="badge bg-secondary">Leído</span>
                          ) : (
                            <span className="badge bg-primary">Nuevo</span>
                          )}
                        </td>
                        <td className="text-nowrap">
                          {fecha ? new Date(fecha).toLocaleDateString('es-CL') : '-'}
                        </td>
                        <td>
                          <div className="fw-semibold">{c.nombre}</div>
                          {c.correo && (
                            <a href={`mailto:${c.correo}`} className="small text-muted">
                              {c.correo}
                            </a>
                          )}
                        </td>
                        <td style={{ maxWidth: '420px', whiteSpace: 'pre-wrap' }}>
                          {obtenerTexto(c)}
                        </td>
                        <td className="text-end text-nowrap">
                          {!leido && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success me-2"
                              disabled={procesandoId === id}
                              onClick={() => handleMarcarLeido(c)}
                            >
                              Marcar leído
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={procesandoId === id}
                            onClick={() => handleEliminar(c)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}