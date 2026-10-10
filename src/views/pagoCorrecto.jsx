import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { DatosCliente, formatearPrecio, TablaCompra } from './DatosCompra'

// Vista Pago correcto: boleta de la orden (GET /api/ordenes/:id)
export default function PagoCorrecto() {
  const [params] = useSearchParams()
  const id = params.get('id')

  const [orden, setOrden] = useState(null)
  const [estado, setEstado] = useState(id ? 'cargando' : 'sinId') // cargando | ok | noEncontrada | error | sinId

  useEffect(() => {
    if (!id) return
    let vigente = true
    fetch('/api/ordenes/' + id)
      .then((respuesta) => {
        if (respuesta.status === 404) throw new Error('404')
        return respuesta.json()
      })
      .then((datos) => {
        if (!vigente) return
        setOrden(datos)
        setEstado('ok')
      })
      .catch((err) => {
        console.log('Error al traer la orden:', err)
        if (vigente) setEstado(err.message === '404' ? 'noEncontrada' : 'error')
      })
    return () => { vigente = false }
  }, [id])

  const mensajes = {
    sinId: 'No se indicó el número de la orden.',
    noEncontrada: 'No encontramos la orden solicitada.',
    error: 'No se pudo cargar la boleta.',
  }

  if (estado === 'cargando') {
    return <div className="background min-vh-100 text-white text-center pt-5">Cargando boleta...</div>
  }

  if (estado !== 'ok') {
    return (
      <div className="background min-vh-100">
        <div className="container my-5 text-center text-white">
          <h2 className="mb-3"><span className="text-warning">⚠</span> Boleta no disponible</h2>
          <p>{mensajes[estado]}</p>
          <Link to="/productos" className="btn btn-light">Ir a productos</Link>
        </div>
      </div>
    )
  }

  // si no está pagada, no corresponde mostrar la boleta
  if (orden.estado !== 'Pagada') return <Navigate to={'/pagoError?id=' + id} replace />

  const cliente = {
    nombre: orden.nombre_cliente,
    apellidos: orden.apellidos_cliente,
    correo: orden.correo_cliente,
    calle: orden.calle,
    departamento: orden.departamento,
    region: orden.nombre_region,
    comuna: orden.nombre_comuna,
    indicaciones: orden.indicaciones,
    entrega: orden.opcion_entrega,
  }

  const filas = orden.detalle.map((d) => ({
    nombre: d.nombre_producto,
    imagen: d.imagen_producto,
    precio: d.precio_unitario,
    cantidad: d.cantidad,
    subtotal: d.subtotal,
  }))

  // abre el programa de correo con el resumen (no hay servicio de correo en el servidor)
  const enviarPorEmail = () => {
    let cuerpo = 'Gracias por tu compra en Splendor.\n\nOrden #' + orden.numero_orden + '\n\n'
    filas.forEach((f) => {
      cuerpo += f.nombre + ' x' + f.cantidad + ' - $' + formatearPrecio(f.subtotal) + '\n'
    })
    cuerpo += '\nTotal pagado: $' + formatearPrecio(orden.total)
    window.location.href =
      'mailto:' + encodeURIComponent(orden.correo_cliente) +
      '?subject=' + encodeURIComponent('Boleta compra #' + orden.numero_orden) +
      '&body=' + encodeURIComponent(cuerpo)
  }

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-end text-muted small">Código orden: ORDER{orden.id_orden}</div>
                <h3 className="fw-bold text-success mb-1">
                  ✔ Se ha realizado la compra. nro <span id="numeroOrden">#{orden.numero_orden}</span>
                </h3>
                <p className="text-muted mb-4">Gracias por comprar en Splendor. Este es el resumen de tu compra.</p>

                <DatosCliente cliente={cliente} />
                <TablaCompra filas={filas} />

                <div className="border rounded-3 p-3 text-center fw-bold fs-5 shadow-sm mb-4" id="totalPagado">
                  Total pagado: ${formatearPrecio(orden.total)}
                </div>

                <div className="text-center no-print">
                  <button className="btn btn-danger me-2" id="btnImprimir" onClick={() => window.print()}>
                    Imprimir boleta en PDF
                  </button>
                  <button className="btn btn-success me-2" id="btnEmail" onClick={enviarPorEmail}>
                    Enviar boleta por email
                  </button>
                  <Link to="/productos" className="btn btn-outline-dark">Seguir comprando</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}
