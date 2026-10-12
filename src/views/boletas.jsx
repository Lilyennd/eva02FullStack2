import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordenesApi } from "../services/api";
import "../assets/css/style.css";

export default function Boletas() {
  const [boletas, setBoletas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ordenesApi.listar()
      .then((datos) => setBoletas(datos))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="spinner-border m-4" />
  if (error) return <div className="alert alert-danger m-4">{error}</div>

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">Boletas</h2>

      <div className="tabla-boletas table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Productos</th>
              <th>Cliente</th>
              <th>Destino</th>
              <th>Entrega</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {boletas.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center texto-gris py-4">
                  No hay boletas registradas.
                </td>
              </tr>
            )}

            {boletas.map((b) => {
              const fecha = new Date(b.fecha_orden)
              return (
                <tr key={b.id_orden}>
                  <td>
                    <span className="cuadro-orden"></span> <b>#{b.numero_orden || b.id_orden}</b>
                  </td>
                  <td>
                    <b>{fecha.toLocaleDateString('es-CL')}</b>
                    <br />
                    <small className="texto-gris">
                      {fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </td>
                  <td>
                    <span className={`estado estado-${b.estado.replace(' ', '-').toLowerCase()}`}>
                      {b.estado}
                    </span>
                  </td>
                  <td>
                    <b>{b.unidades} unidades</b>
                    <br />
                    <small className="texto-gris">{b.lineas} productos</small>
                  </td>
                  <td>
                    <b>{b.nombre_cliente} {b.apellidos_cliente}</b>
                    <br />
                    <small className="texto-gris">{b.correo_cliente}</small>
                  </td>
                  <td>
                    <b>{b.nombre_comuna}</b>
                    <br />
                    <small className="texto-gris">{b.nombre_region}</small>
                  </td>
                  <td><span className="enlace-azul">{b.opcion_entrega}</span></td>
                  <td><b>${Number(b.total).toLocaleString('es-CL')}</b></td>
                  <td>
                    <Link to={`/detalleBoleta/${b.id_orden}`} className="btn btn-primary btn-sm">
                      Ver detalles
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}