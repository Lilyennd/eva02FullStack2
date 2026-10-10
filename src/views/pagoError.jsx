import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DatosCliente, formatearPrecio, TablaCompra } from './DatosCompra'

// Vista Pago con error.
// Si la orden llegó a crearse (?id=...) se lee del servidor; si no, se usan los datos
// que Checkout dejó guardados en sessionStorage ('checkoutError').

function leerRespaldo() {
  try {
    return JSON.parse(sessionStorage.getItem('checkoutError'))
  } catch {
    return null
  }
}

// Convierte lo guardado por Checkout al mismo formato que la orden del servidor
export function datosDesdeRespaldo(respaldo) {
  const d = respaldo.datos
  return {
    numero: '',
    total: respaldo.total,
    cliente: {
      nombre: d.nombre,
      apellidos: d.apellidos,
      correo: d.correo,
      calle: d.calle,
      departamento: d.departamento,
      region: d.nombre_region,
      comuna: d.nombre_comuna,
      indicaciones: d.indicaciones,
    },
    filas: respaldo.items.map((i) => ({
      nombre: i.nombre,
      precio: i.precio,
      cantidad: i.cantidad,
      subtotal: i.precio * i.cantidad,
    })),
  }
}

export default function PagoError() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')

  const [respaldo] = useState(leerRespaldo)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let vigente = true

    async function cargar() {
      if (id) {
        try {
          const res = await fetch('/api/ordenes/' + id)
          if (res.ok) {
            const orden = await res.json()
            if (!vigente) return
            setDatos({
              numero: orden.numero_orden,
              total: orden.total,
              cliente: {
                nombre: orden.nombre_cliente,
                apellidos: orden.apellidos_cliente,
                correo: orden.correo_cliente,
                calle: orden.calle,
                departamento: orden.departamento,
                region: orden.nombre_region,
                comuna: orden.nombre_comuna,
                indicaciones: orden.indicaciones,
              },
              filas: orden.detalle.map((d) => ({
                nombre: d.nombre_producto,
                precio: d.precio_unitario,
                cantidad: d.cantidad,
                subtotal: d.subtotal,
              })),
            })
            setCargando(false)
            return
          }
        } catch (err) {
          console.log('Error al traer la orden:', err)
        }
      }

      // sin orden en el servidor: se usa lo que guardó el checkout
      if (!vigente) return
      if (respaldo) setDatos(datosDesdeRespaldo(respaldo))
      setCargando(false)
    }

    cargar()
    return () => { vigente = false }
  }, [id, respaldo])

  if (cargando) {
    return <div className="background min-vh-100 text-white text-center pt-5">Cargando...</div>
  }

  if (!datos) {
    return (
      <div className="background min-vh-100">
        <div className="container my-5 text-center text-white">
          <h2 className="mb-3">No hay un pago pendiente</h2>
          <Link to="/productos" className="btn btn-light">Ir a productos</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3 className="fw-bold text-danger mb-1">
                  ✖ No se pudo realizar el pago<span id="numeroOrden">{datos.numero ? '. nro #' + datos.numero : ''}</span>
                </h3>
                <div className="alert alert-danger mt-3" role="alert" id="motivoError">
                  {respaldo?.mensaje || 'El pago no pudo ser procesado.'}
                </div>

                <div className="text-center my-3">
                  {/* el carrito sigue guardado: basta con volver al checkout */}
                  <button className="btn btn-success" id="btnReintentar" onClick={() => navigate('/checkout')}>
                    VOLVER A REALIZAR EL PAGO
                  </button>
                </div>

                <DatosCliente cliente={datos.cliente} />
                <TablaCompra filas={datos.filas} conImagen={false} />

                <div className="border rounded-3 p-3 text-center fw-bold fs-5 shadow-sm" id="totalError">
                  Total a pagar: ${formatearPrecio(datos.total)}
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
