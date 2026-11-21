import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, productosApi, urlImagen } from '../services/api'
import { esAdmin, useUsuario } from '../services/sesion'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const rutaImagenProducto = (img) => urlImagen(img, 'productos')

export function TarjetaInventario({ producto, admin, onEliminar }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div className="card h-100 shadow-sm">
        <img
          src={rutaImagenProducto(producto.imagen_principal)}
          className="card-img-top"
          alt={producto.nombre}
          style={{ height: '220px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{producto.nombre}</h5>
          <p className="card-text text-muted mb-1">Código: {producto.codigo_producto}</p>
          <p className="card-text text-muted mb-1">Stock: {producto.stock}</p>
          <p className="card-text text-muted">{producto.origen ? producto.origen : ''}</p>
          {producto.en_oferta && producto.precio_oferta ? (
            <p className="card-text fw-bold">
              <span className="text-muted text-decoration-line-through me-2">
                ${formatearPrecio(producto.precio)}
              </span>
              <span className="text-danger">${formatearPrecio(producto.precio_oferta)}</span>
            </p>
          ) : (
            <p className="card-text fw-bold">${formatearPrecio(producto.precio)}</p>
          )}

          <div className="mt-auto d-flex gap-2">
            {admin ? (
              <>
                <Link
                  to={`/modificarProducto/${producto.id_producto}`}
                  className="btn btn-outline-dark flex-fill"
                  style={{ backgroundColor: '#263869', borderColor: '#3f4d7a', color: 'white' }}
                >
                  Modificar
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => onEliminar(producto.id_producto, producto.nombre)}
                >
                  Eliminar
                </button>
              </>
            ) : (
              <Link
                to={`/producto/${producto.id_producto}`}
                className="btn btn-outline-secondary w-100"
              >
                Ver detalle
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Inventario() {
  const usuario = useUsuario()
  const admin = esAdmin(usuario)
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState(false)

  const cargar = () => {
    apiFetch('/api/productos')
      .then((respuesta) => respuesta.json())
      .then(setProductos)
      .catch((err) => {
        console.log('Error al traer los productos:', err)
        setError(true)
      })
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de desactivar el producto "${nombre}"?`)) return
    try {
      await productosApi.eliminar(id)
      alert('Producto eliminado correctamente.')
      cargar()
    } catch (err) {
      alert(err.message || 'Error al eliminar el producto.')
    }
  }

  const termino = busqueda.trim().toLowerCase()
  const productosFiltrados = !termino
    ? productos
    : productos.filter((p) =>
        `${p.nombre || ''} ${p.codigo_producto || ''} ${p.origen || ''}`
          .toLowerCase()
          .includes(termino)
      )

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-center mb-0 herotitulo" style={{ color: '#f4f5fa' }}>
            Inventario de Productos
          </h1>
          {admin && (
            <Link
              to="/nuevoProducto"
              className="btn btn-dark"
              style={{
                backgroundColor: '#f4f5fa',
                borderColor: '#f5f5fa',
                color: 'rgb(24, 24, 68)',
                fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
              }}
            >
              Agregar Nuevo Producto
            </Link>
          )}
        </div>

        <div className="mb-4">
          <input
            type="search"
            id="buscadorInventario"
            className="form-control"
            aria-label="Buscar en inventario"
            placeholder="Buscar en inventario por nombre, código u origen..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="row g-4" id="listaProductos">
          {error && <p className="text-danger">No se pudieron cargar los productos.</p>}
          {!error && productos.length > 0 && productosFiltrados.length === 0 && (
            <p className="text-center text-white">
              No se encontraron productos en inventario para "{busqueda}".
            </p>
          )}
          {!error &&
            productosFiltrados.map((producto) => (
              <TarjetaInventario
                key={producto.id_producto}
                producto={producto}
                admin={admin}
                onEliminar={handleEliminar}
              />
            ))}
        </div>
      </div>
      <br />
    </div>
  )
}