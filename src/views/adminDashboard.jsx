import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../services/api'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')

export function TarjetaResumen({ titulo, valor, detalle, clase }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div className={`card text-white h-100 ${clase}`}>
        <div className="card-body">
          <h6 className="card-subtitle mb-2">{titulo}</h6>
          <h2 className="card-title">{valor}</h2>
          <small>{detalle}</small>
        </div>
      </div>
    </div>
  )
}

const ACCESOS = [
  { to: '/adminOrdenes', texto: 'Órdenes / Boletas' },
  { to: '/inventario', texto: 'Productos' },
  { to: '/productosCriticos', texto: 'Productos críticos' },
  { to: '/adminCategorias', texto: 'Categorías' },
  { to: '/listarUsuarios', texto: 'Usuarios' },
  { to: '/reportes', texto: 'Reportes' },
  { to: '/perfil', texto: 'Perfil' },
]

export default function AdminDashboard() {
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    dashboardApi
      .resumen()
      .then((datos) => vigente && setResumen(datos))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Dashboard</h1>
        {error && <p className="text-danger text-center">No se pudo cargar el resumen: {error}</p>}
        {!error && !resumen && <p className="text-center text-white">Cargando...</p>}

        {resumen && (
          <div className="row g-3 mb-4" id="tarjetasResumen">
            <TarjetaResumen titulo="Compras" valor={resumen.compras} clase="bg-primary"
              detalle={`Ingresos: $${formatearPrecio(resumen.ingresos)}`} />
            <TarjetaResumen titulo="Productos" valor={resumen.productos} clase="bg-success"
              detalle={`Inventario: ${resumen.inventario_unidades} unidades`} />
            <TarjetaResumen titulo="Usuarios" valor={resumen.usuarios} clase="bg-warning"
              detalle={`Nuevos (30 días): ${resumen.usuarios_nuevos_30d}`} />
            <TarjetaResumen titulo="Productos críticos" valor={resumen.productos_criticos} clase="bg-danger"
              detalle="Stock igual o bajo el mínimo" />
            <TarjetaResumen titulo="Mensajes sin leer" valor={resumen.mensajes_sin_leer} clase="bg-secondary"
              detalle="Formulario de contacto" />
          </div>
        )}

        <div className="d-flex flex-wrap justify-content-center gap-2" id="accesosRapidos">
          {ACCESOS.map((acceso) => (
            <Link key={acceso.to} to={acceso.to} className="btn btn-outline-light">
              {acceso.texto}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}