import { useEffect, useState } from 'react'
import { apiFetch, ordenesApi } from '../services/api'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')


export default function Reportes() {
  const [ordenes, setOrdenes] = useState([])
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    Promise.all([
      ordenesApi.listar(),
      apiFetch('/api/productos').then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar los productos')
        return r.json()
      }),
    ])
      .then(([listaOrdenes, listaProductos]) => {
        if (!vigente) return
        setOrdenes(Array.isArray(listaOrdenes) ? listaOrdenes : [])
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
      })
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [])


  const porEstado = {}
  ordenes.forEach((o) => {
    if (!porEstado[o.estado]) porEstado[o.estado] = { cantidad: 0, total: 0 }
    porEstado[o.estado].cantidad += 1
    porEstado[o.estado].total += Number(o.total)
  })

  const ingresos = ordenes
    .filter((o) => o.estado === 'Pagada')
    .reduce((suma, o) => suma + Number(o.total), 0)

  const unidades = productos.reduce((suma, p) => suma + Number(p.stock), 0)
  const valorInventario = productos.reduce((suma, p) => suma + Number(p.stock) * Number(p.precio), 0)

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Reportes</h1>
        {error && <p className="text-danger text-center">{error}</p>}

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm h-100"><div className="card-body">
              <h6 className="text-muted">Ingresos (órdenes pagadas)</h6>
              <h3 className="fw-bold">${formatearPrecio(ingresos)}</h3>
            </div></div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm h-100"><div className="card-body">
              <h6 className="text-muted">Unidades en inventario</h6>
              <h3 className="fw-bold">{unidades}</h3>
            </div></div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm h-100"><div className="card-body">
              <h6 className="text-muted">Valor del inventario</h6>
              <h3 className="fw-bold">${formatearPrecio(valorInventario)}</h3>
            </div></div>
          </div>
        </div>

        <div className="card shadow border-0 rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3">Órdenes por estado</h5>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead><tr><th>Estado</th><th>Cantidad</th><th>Total</th></tr></thead>
              <tbody>
                {Object.keys(porEstado).length === 0 && (
                  <tr><td colSpan={3} className="text-center">No hay órdenes.</td></tr>
                )}
                {Object.entries(porEstado).map(([estado, d]) => (
                  <tr key={estado}>
                    <td>{estado}</td>
                    <td>{d.cantidad}</td>
                    <td>${formatearPrecio(d.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow border-0 rounded-4 p-4">
          <h5 className="fw-bold mb-3">Inventario por producto</h5>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead><tr><th>Código</th><th>Producto</th><th>Stock</th><th>Precio</th><th>Valor en stock</th></tr></thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id_producto}>
                    <td>{p.codigo_producto}</td>
                    <td>{p.nombre}</td>
                    <td>{p.stock}</td>
                    <td>${formatearPrecio(p.precio)}</td>
                    <td>${formatearPrecio(Number(p.stock) * Number(p.precio))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}