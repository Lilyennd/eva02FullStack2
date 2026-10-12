import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ordenesApi } from "../services/api";
import "../assets/css/style.css";

const dinero = (n) => '$' + Number(n).toLocaleString('es-CL')

export default function DetalleBoleta() {
  const { id } = useParams()
  const [orden, setOrden] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ordenesApi.obtener(id)
      .then((datos) => setOrden(datos))
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <div className="alert alert-danger m-4">{error}</div>
  if (!orden) return <div className="spinner-border m-4" />

  return (
    <div className="boleta container my-4">
      <div className="boleta-encabezado">
        <h3>Boleta N° {orden.numero_orden || orden.id_orden}</h3>
        <span className={`estado estado-${orden.estado.replace(' ', '-').toLowerCase()}`}>
          {orden.estado}
        </span>
      </div>
      <p>Fecha: {new Date(orden.fecha_orden).toLocaleDateString('es-CL')}</p>

      <h5>Cliente</h5>
      <p>{orden.nombre_cliente} {orden.apellidos_cliente} - {orden.correo_cliente}</p>

      <h5>Dirección de entrega</h5>
      <p>
        {orden.calle}{orden.departamento ? ', Depto ' + orden.departamento : ''}
        <br />
        {orden.nombre_comuna}, {orden.nombre_region}
      </p>
      {orden.indicaciones && <p>Indicaciones: {orden.indicaciones}</p>}

      <table className="boleta-tabla table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orden.detalle.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.nombre_producto}</td>
              <td>{dinero(p.precio_unitario)}</td>
              <td>{p.cantidad}</td>
              <td>{dinero(p.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {orden.descuento > 0 && <p>Descuento: -{dinero(orden.descuento)}</p>}
      {orden.costo_envio > 0 && <p>Envío: {dinero(orden.costo_envio)}</p>}
      <h4 className="boleta-total">Total: {dinero(orden.total)}</h4>

      <div className="boleta-botones no-imprimir">
        <button className="btn btn-danger" onClick={() => window.print()}>
          Imprimir boleta en PDF
        </button>
        <Link to="/boletas" className="btn btn-secondary">Volver</Link>
      </div>
    </div>
  )
}