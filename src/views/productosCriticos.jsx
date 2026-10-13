import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productosApi } from '../services/api'

// Productos con stock <= stock crítico: GET /api/productos/criticos
export default function ProductosCriticos() {
  const [productos, setProductos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    productosApi
      .criticos()
      .then((lista) => vigente && setProductos(lista))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Productos críticos</h1>
        <div className="card shadow border-0 rounded-4 p-4">
          {error && <p className="text-danger mb-0">No se pudo cargar el listado: {error}</p>}
          {!error && productos.length === 0 && (
            <p className="text-center mb-0" id="sinCriticos">No hay productos con stock crítico.</p>
          )}
          {!error && productos.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th></th></tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id_producto}>
                      <td>{p.codigo_producto}</td>
                      <td>{p.nombre}</td>
                      <td>{p.nombre_categoria}</td>
                      <td><span className="badge bg-danger">{p.stock}</span></td>
                      <td>{p.stock_critico}</td>
                      <td>
                        <Link to={`/modificarProducto?id=${p.id_producto}`} className="btn btn-sm btn-warning">Reponer</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
