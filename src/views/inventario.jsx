import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Antes venían de utils/validaciones y utils/imagenes
const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const rutaImagenProducto = (img) => (img ? `/img/productos/${img}` : '/img/fondoaz.jpg')

export function TarjetaInventario({ producto }) {
  return (
    <div className="col-12 col-sm-6 col-lg-4">
      <div className="card h-100">
        <img
          src={rutaImagenProducto(producto.imagen_principal)}
          className="card-img-top"
          alt={producto.nombre}
          style={{ height: '220px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{producto.nombre}</h5>
          <p className="card-text text-muted mb-1">Stock: {producto.stock}</p>
          <p className="card-text text-muted">{producto.origen ? producto.origen : ''}</p>
          <p className="card-text fw-bold">${formatearPrecio(producto.precio)}</p>
          <Link
            to={`/modificarProducto?id=${producto.id_producto}`}
            className="btn btn-outline-dark mt-auto ; textbasico"
            style={{ backgroundColor: '#263869', borderColor: '#3f4d7a' }}
          >
            Modificar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/productos')
      .then((respuesta) => respuesta.json())
      .then(setProductos)
      .catch((err) => {
        console.log('Error al traer los productos:', err)
        setError(true)
      })
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-center mb-0 ; herotitulo" style={{ color: '#f4f5fa' }}>
            Inventario de Productos
          </h1>
          <Link
            to="/nuevoProducto"
            className="btn btn-dark ; "
            style={{
              backgroundColor: '#f4f5fa',
              borderColor: '#f5f5fa',
              color: 'rgb(24, 24, 68)',
              fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
            }}
          >
            Agregar Nuevo Producto
          </Link>
        </div>
        <div className="row g-4" id="listaProductos">
          {error && <p className="text-danger">No se pudieron cargar los productos.</p>}
          {!error &&
            productos.map((producto) => (
              <TarjetaInventario key={producto.id_producto} producto={producto} />
            ))}
        </div>
      </div>
      <br />
    </div>
  )
}