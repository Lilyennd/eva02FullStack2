import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordenesApi } from '../services/api'
import { esVendedor, useUsuario } from '../services/sesion'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')


export const ESTADOS_ORDEN = ['Pendiente', 'Procesando', 'Pagada']
export const ESTADOS = ['Todas', ...ESTADOS_ORDEN]

const BADGE_ESTADO = {
  Pendiente: 'bg-warning text-dark',
  Procesando: 'bg-info text-dark',
  Pagada: 'bg-success',
}

export function filtrarOrdenes(ordenes, estado, texto) {
  const t = texto.trim().toLowerCase()
  return ordenes.filter((o) => {
    const okEstado = !estado || estado === 'Todas' || o.estado === estado
    const nombre = `${o.nombre_cliente || ''} ${o.apellidos_cliente || ''}`.toLowerCase()
    const okTexto = !t || String(o.numero_orden).toLowerCase().includes(t) || nombre.includes(t)
    return okEstado && okTexto
  })
}

export function TablaOrdenes({ ordenes, onCambiarEstado, actualizandoId }) {
  if (ordenes.length === 0) return <p className="text-center mb-0">No hay órdenes para mostrar.</p>

  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>N° orden</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => (
            <tr key={o.id_orden}>
              <td>{o.numero_orden}</td>
              <td>{o.nombre_cliente} {o.apellidos_cliente}</td>
              <td>{new Date(o.fecha_orden).toLocaleDateString('es-CL')}</td>
              <td>
                {onCambiarEstado ? (
                  <select
                    className="form-select form-select-sm w-auto"
                    aria-label={`Estado de orden ${o.numero_orden}`}
                    value={o.estado}
                    disabled={actualizandoId === o.id_orden}
                    onChange={(e) => onCambiarEstado(o.id_orden, e.target.value)}
                  >
                    {!ESTADOS_ORDEN.includes(o.estado) && (
                      <option value={o.estado} disabled>
                        {o.estado}
                      </option>
                    )}
                    {ESTADOS_ORDEN.map((est) => (
                      <option key={est} value={est}>
                        {est}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`badge ${BADGE_ESTADO[o.estado] || 'bg-dark'}`}>
                    {o.estado}
                  </span>
                )}
              </td>
              <td>${formatearPrecio(o.total)}</td>
              <td>
                <Link to={`/boleta/${o.id_orden}`} className="btn btn-sm btn-outline-dark">
                  Ver boleta
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminOrdenes() {

  const puedeCambiarEstado = !esVendedor(useUsuario())
  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [estado, setEstado] = useState('')
  const [texto, setTexto] = useState('')
  const [actualizandoId, setActualizandoId] = useState(null)

  useEffect(() => {
    let vigente = true
    ordenesApi
      .listar()
      .then((lista) => vigente && setOrdenes(Array.isArray(lista) ? lista : []))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [])

  const handleCambiarEstado = async (idOrden, nuevoEstado) => {
    setMensaje({ tipo: '', texto: '' })
    setActualizandoId(idOrden)
    try {
      const ordenActualizada = await ordenesApi.cambiarEstado(idOrden, nuevoEstado)
      setOrdenes((prev) =>
        prev.map((o) =>
          o.id_orden === idOrden
            ? { ...o, estado: ordenActualizada?.estado || nuevoEstado }
            : o
        )
      )
      setMensaje({
        tipo: 'success',
        texto: `Estado de la orden actualizado a "${nuevoEstado}".`,
      })
    } catch (err) {
      setMensaje({
        tipo: 'danger',
        texto: err.message || 'No se pudo actualizar el estado de la orden (verifica tus permisos).',
      })
    } finally {
      setActualizandoId(null)
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Órdenes / Boletas</h1>
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
                id="filtroEstado"
                aria-label="Filtrar por estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="" hidden>Buscar por estado</option>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-8">
              <input
                className="form-control"
                id="filtroTexto"
                placeholder="Buscar por n° de orden o cliente"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p className="text-danger text-center mb-0">No se pudieron cargar las órdenes: {error}</p>
          ) : (
            <TablaOrdenes
              ordenes={filtrarOrdenes(ordenes, estado, texto)}
              onCambiarEstado={puedeCambiarEstado ? handleCambiarEstado : undefined}
              actualizandoId={actualizandoId}
            />
          )}
        </div>
      </div>
    </div>
  )
}