import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ordenesApi } from '../services/api'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')

export default function MostrarBoleta() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const [orden, setOrden] = useState(null)
  const [error, setError] = useState(id ? '' : 'No se indicó la orden.')

  useEffect(() => {
    if (!id) return
    let vigente = true
    ordenesApi
      .obtener(id)
      .then((datos) => vigente && setOrden(datos))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [id])

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="card shadow border-0 rounded-4 p-4">
          {error && <p className="text-danger">{error}</p>}
          {!error && !orden && <p>Cargando boleta...</p>}
          {orden && (
            <>
              <h3 className="fw-bold">Boleta N° {orden.numero_orden}</h3>
              <p className="mb-1"><b>Estado:</b> {orden.estado}</p>
              <p className="mb-1"><b>Fecha:</b> {new Date(orden.fecha_orden).toLocaleDateString('es-CL')}</p>
              <p className="mb-1"><b>Cliente:</b> {orden.nombre_cliente} {orden.apellidos_cliente} ({orden.correo_cliente})</p>
              <p><b>Dirección:</b> {orden.calle}{orden.departamento ? ', ' + orden.departamento : ''}, {orden.nombre_comuna}, {orden.nombre_region}</p>
              <div className="table-responsive">
                <table className="table">
                  <thead><tr><th>Producto</th><th>Precio</th><th>Cant.</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {orden.detalle.map((d) => (
                      <tr key={d.id_producto}>
                        <td>{d.nombre_producto}</td>
                        <td>${formatearPrecio(d.precio_unitario)}</td>
                        <td>{d.cantidad}</td>
                        <td>${formatearPrecio(d.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {orden.descuento > 0 && <p className="text-end mb-1">Descuento: -${formatearPrecio(orden.descuento)}</p>}
              {orden.costo_envio > 0 && <p className="text-end mb-1">Envío: ${formatearPrecio(orden.costo_envio)}</p>}
              <h4 className="text-end">Total: ${formatearPrecio(orden.total)}</h4>
            </>
          )}
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-danger" onClick={() => window.print()}>Imprimir boleta</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
          </div>
        </div>
      </div>
    </div>
  )
}