import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordenesApi } from '../services/api'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
export const ESTADOS = ['Todos', 'Pendiente', 'Procesando', 'Pagada', 'Pago fallido', 'Enviado', 'Entregado', 'Cancelado']


export function filtrarOrdenes(ordenes, estado, texto) {
  const t = texto.trim().toLowerCase()
  return ordenes.filter((o) => {
    const okEstado = estado === 'Todos' || o.estado === estado
    const nombre = `${o.nombre_cliente} ${o.apellidos_cliente}`.toLowerCase()
    const okTexto = !t || String(o.numero_orden).toLowerCase().includes(t) || nombre.includes(t)
    return okEstado && okTexto
  })
}

export function TablaOrdenes({ ordenes }) {
  if (ordenes.length === 0) return <p className="text-center mb-0">No hay órdenes para mostrar.</p>
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>N° orden</th><th>Cliente</th><th>Fecha</th><th>Estado</th><th>Total</th><th></th>
          </tr>
        </thead>
        <tbody>
          {ordenes.map((o) => (
            <tr key={o.id_orden}>
              <td>{o.numero_orden}</td>
              <td>{o.nombre_cliente} {o.apellidos_cliente}</td>
              <td>{new Date(o.fecha_orden).toLocaleDateString('es-CL')}</td>
              <td><span className="badge bg-dark">{o.estado}</span></td>
              <td>${formatearPrecio(o.total)}</td>
              <td>
                <Link to={`/mostrarBoleta?id=${o.id_orden}`} className="btn btn-sm btn-outline-dark">
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
  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState('')
  const [estado, setEstado] = useState('Todos')
  const [texto, setTexto] = useState('')

  useEffect(() => {
    let vigente = true
    ordenesApi
      .listar()
      .then((lista) => vigente && setOrdenes(lista))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Órdenes / Boletas</h1>
        <div className="card shadow border-0 rounded-4 p-4">
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <select className="form-select" id="filtroEstado" value={estado}
                onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="col-md-8">
              <input className="form-control" id="filtroTexto" placeholder="Buscar por n° de orden o cliente"
                value={texto} onChange={(e) => setTexto(e.target.value)} />
            </div>
          </div>
          {error ? (
            <p className="text-danger text-center mb-0">No se pudieron cargar las órdenes: {error}</p>
          ) : (
            <TablaOrdenes ordenes={filtrarOrdenes(ordenes, estado, texto)} />
          )}
        </div>
      </div>
    </div>
  )
}
