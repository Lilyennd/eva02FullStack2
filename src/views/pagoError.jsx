import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { DatosCliente, formatearPrecio, TablaCompra } from './DatosCompra'
import { apiFetch } from '../services/api'

// Vista Pago con error.
// Si la orden llegó a crearse (?id=...) se lee del servidor; si no, se usan los datos
// que Checkout o Carrito dejaron guardados en sessionStorage ('checkoutError').

function leerRespaldo() {
  try {
    return JSON.parse(sessionStorage.getItem('checkoutError'))
  } catch {
    return null
  }
}

// Datos de ejemplo por defecto en caso de acceder sin sesión previa
const datosDemoDefecto = {
  numero: '20261012-ERR01',
  total: 990000,
  cliente: {
    nombre: 'Cliente',
    apellidos: 'Prueba',
    correo: 'cliente.prueba@ejemplo.cl',
    calle: 'Av. Siempre Viva 123',
    departamento: 'Depto 402',
    region: 'Región Metropolitana de Santiago',
    comuna: 'Santiago',
    indicaciones: 'Sin indicaciones especiales',
  },
  filas: [
    { nombre: 'Diamante Princesa 0.75ct', precio: 990000, cantidad: 1, subtotal: 990000 }
  ],
}

// Convierte lo guardado por Checkout al mismo formato que la orden del servidor
export function datosDesdeRespaldo(respaldo) {
  const d = respaldo.datos
  return {
    numero: d.numero || '',
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
          const res = await apiFetch('/api/ordenes/' + id)
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

      if (!vigente) return
      // Si hay datos en respaldo los usa, si no muestra los datos de demo
      setDatos(respaldo ? datosDesdeRespaldo(respaldo) : datosDemoDefecto)
      setCargando(false)
    }

    cargar()
    return () => { vigente = false }
  }, [id, respaldo])

  if (cargando) {
    return <div className="background min-vh-100 text-white text-center pt-5">Cargando...</div>
  }

  return (
    <div className="background min-vh-100 py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3 className="fw-bold text-danger mb-1">
                  ✖ No se pudo realizar el pago{datos.numero ? `. nro #${datos.numero}` : ''}
                </h3>
                <div className="alert alert-danger mt-3" role="alert" id="motivoError">
                  {respaldo?.mensaje || 'El pago no pudo ser procesado por la entidad bancaria.'}
                </div>

                <div className="text-center my-4">
                  <button className="btn btn-success btn-lg px-4 fw-bold" id="btnReintentar" onClick={() => navigate('/checkout')}>
                    VOLVER A REALIZAR EL PAGO
                  </button>
                </div>

                <DatosCliente cliente={datos.cliente} />
                <TablaCompra filas={datos.filas} conImagen={false} />

                <div className="border rounded-3 p-3 text-center fw-bold fs-5 shadow-sm mt-3" id="totalError">
                  Total a pagar: ${formatearPrecio(datos.total)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}