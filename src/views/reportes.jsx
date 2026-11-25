import { useEffect, useState } from 'react'
import { apiFetch, ordenesApi } from '../services/api'
import { exportarExcel } from '../services/exportarExcel'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-CL')

export default function Reportes() {
  const [ordenes, setOrdenes] = useState([])
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [filtro, setFiltro] = useState({ desde: '', hasta: '' })

 
  useEffect(() => {
    let vigente = true
    apiFetch('/api/productos')
      .then((r) => {
        if (!r.ok) throw new Error('No se pudieron cargar los productos')
        return r.json()
      })
      .then((lista) => vigente && setProductos(Array.isArray(lista) ? lista : []))
      .catch((err) => vigente && setError(err.message))
    return () => { vigente = false }
  }, [])


  useEffect(() => {
    let vigente = true
    ordenesApi
      .listar(null, filtro)
      .then((lista) => {
        if (!vigente) return
        setOrdenes(Array.isArray(lista) ? lista : [])
        setError('')
      })
      .catch((err) => vigente && setError(err.message))
    return () => { vigente = false }
  }, [filtro])

  const aplicar = (e) => {
    e.preventDefault()
    if (desde && hasta && desde > hasta) {
      setError('La fecha "desde" no puede ser posterior a "hasta".')
      return
    }
    setError('')
    setFiltro({ desde, hasta })
  }

  const limpiar = () => {
    setDesde('')
    setHasta('')
    setError('')
    setFiltro({ desde: '', hasta: '' })
  }


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


  const textoPeriodo =
    filtro.desde || filtro.hasta
      ? `Órdenes entre ${filtro.desde || 'el inicio'} y ${filtro.hasta || 'hoy'}`
      : 'Mostrando todas las órdenes'

 
  const descargarVentas = () => {
    const filas = ordenes.map((o) => ({
      numero_orden: o.numero_orden,
      fecha: formatearFecha(o.fecha_orden),
      cliente: o.nombre_cliente + ' ' + o.apellidos_cliente,
      correo: o.correo_cliente,
      estado: o.estado,
      descuento: Number(o.descuento || 0),
      envio: Number(o.costo_envio || 0),
      total: Number(o.total),
    }))
    exportarExcel(
      'reporte-ventas',
      [
        { titulo: 'N° orden', campo: 'numero_orden' },
        { titulo: 'Fecha', campo: 'fecha' },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Correo', campo: 'correo' },
        { titulo: 'Estado', campo: 'estado' },
        { titulo: 'Descuento', campo: 'descuento' },
        { titulo: 'Envío', campo: 'envio' },
        { titulo: 'Total', campo: 'total' },
      ],
      filas
    )
  }

  const descargarEstados = () => {
    const filas = Object.entries(porEstado).map(([estado, d]) => ({
      estado,
      cantidad: d.cantidad,
      total: d.total,
    }))
    exportarExcel(
      'reporte-ordenes-por-estado',
      [
        { titulo: 'Estado', campo: 'estado' },
        { titulo: 'Cantidad', campo: 'cantidad' },
        { titulo: 'Total', campo: 'total' },
      ],
      filas
    )
  }

  const descargarInventario = () => {
    const filas = productos.map((p) => ({
      codigo: p.codigo_producto,
      producto: p.nombre,
      stock: Number(p.stock),
      precio: Number(p.precio),
      valor: Number(p.stock) * Number(p.precio),
    }))
    exportarExcel(
      'reporte-inventario',
      [
        { titulo: 'Código', campo: 'codigo' },
        { titulo: 'Producto', campo: 'producto' },
        { titulo: 'Stock', campo: 'stock' },
        { titulo: 'Precio', campo: 'precio' },
        { titulo: 'Valor en stock', campo: 'valor' },
      ],
      filas
    )
  }

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
       <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Reportes</h1>


        <div className="solo-impresion text-center mb-4">
          <h2 className="h4 fw-bold mb-1" style={{ color: 'white' }}>
            Reporte de ventas e inventario - Splendor
          </h2>
          <p className="mb-0" style={{ color: '#e2e8f0' }}>
            {textoPeriodo}. Emitido el {new Date().toLocaleDateString('es-CL')}
          </p>
        </div>

        {error && <p className="text-danger text-center">{error}</p>}


        <div className="card shadow-sm p-3 mb-4 no-print">
          <form className="row g-2 align-items-end" onSubmit={aplicar} id="formFiltroFechas">
            <div className="col-md-4">
              <label htmlFor="desde" className="form-label mb-1">Desde</label>
              <input type="date" id="desde" className="form-control" value={desde}
                max={hasta || undefined} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label htmlFor="hasta" className="form-label mb-1">Hasta</label>
              <input type="date" id="hasta" className="form-control" value={hasta}
                min={desde || undefined} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button type="submit" className="btn btn-dark flex-fill">Filtrar</button>
              <button type="button" className="btn btn-outline-secondary flex-fill" onClick={limpiar}>Limpiar</button>
            </div>
          </form>
          <small className="text-muted mt-2">
            {textoPeriodo}. El inventario siempre refleja el stock actual.
          </small>
        </div>


        <div className="card shadow-sm p-3 mb-4 no-print">
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-success" onClick={descargarVentas}
              disabled={ordenes.length === 0}>
              Excel: ventas
            </button>
            <button type="button" className="btn btn-success" onClick={descargarEstados}
              disabled={ordenes.length === 0}>
              Excel: órdenes por estado
            </button>
            <button type="button" className="btn btn-success" onClick={descargarInventario}
              disabled={productos.length === 0}>
              Excel: inventario
            </button>
            <button type="button" className="btn btn-outline-dark ms-md-auto" onClick={() => window.print()}>
              Imprimir reporte
            </button>
          </div>
        </div>

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
          <h5 className="fw-bold mb-3">Detalle de ventas</h5>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead>
                <tr>
                  <th>N° orden</th><th>Fecha</th><th>Cliente</th><th>Estado</th><th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.length === 0 && (
                  <tr><td colSpan={5} className="text-center">No hay ventas en este período.</td></tr>
                )}
                {ordenes.map((o) => (
                  <tr key={o.id_orden}>
                    <td>{o.numero_orden}</td>
                    <td>{formatearFecha(o.fecha_orden)}</td>
                    <td>{o.nombre_cliente} {o.apellidos_cliente}</td>
                    <td>{o.estado}</td>
                    <td>${formatearPrecio(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card shadow border-0 rounded-4 p-4 mb-4">
          <h5 className="fw-bold mb-3">Órdenes por estado</h5>
          <div className="table-responsive">
            <table className="table table-striped align-middle mb-0">
              <thead><tr><th>Estado</th><th>Cantidad</th><th>Total</th></tr></thead>
              <tbody>
                {Object.keys(porEstado).length === 0 && (
                  <tr><td colSpan={3} className="text-center">No hay órdenes en este período.</td></tr>
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