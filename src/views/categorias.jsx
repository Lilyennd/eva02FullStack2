import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { agregar, contarEnCarrito, precioFinal, TarjetaProducto, useCarrito } from './productos'

export function TarjetaCategoria({ categoria, imagen, activa }) {
  return (
    <div className="col-6 col-md-4 col-lg-3">
      <Link to={`/categorias?id=${categoria.id_categoria}`} className="text-decoration-none">
        <div className={`card h-100 text-center shadow-sm ${activa ? 'border-primary border-3' : ''}`}>
          <img
            src={imagen ? `/img/productos/${imagen}` : '/img/fondoaz.jpg'}
            className="card-img-top"
            alt={categoria.nombre_categoria}
            style={{ height: '120px', objectFit: 'cover' }}
          />
          <div className="card-body p-2">
            <h6 className="card-title mb-0 text-dark">{categoria.nombre_categoria}</h6>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function Categorias() {
  const [params] = useSearchParams()
  const idSeleccionada = params.get('id')
  const carrito = useCarrito()

  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/categorias').then((r) => r.json()),
      fetch('/api/productos').then((r) => r.json()),
    ])
      .then(([listaCategorias, listaProductos]) => {
        setCategorias(Array.isArray(listaCategorias) ? listaCategorias : [])
        setProductos(Array.isArray(listaProductos) ? listaProductos : [])
      })
      .catch((err) => {
        console.log('Error al traer categorías:', err)
        setError(true)
      })
      .finally(() => setCargando(false))
  }, [])

  const imagenDeCategoria = (idCategoria) => {
    const primero = productos.find((p) => p.id_categoria === idCategoria && p.imagen_principal)
    return primero ? primero.imagen_principal : ''
  }

  const categoriasAMostrar = idSeleccionada
    ? categorias.filter((c) => String(c.id_categoria) === String(idSeleccionada))
    : categorias

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Categorías</h1>

        <div className="row g-3 justify-content-center" id="listaCategorias">
          {categorias.map((categoria) => (
            <TarjetaCategoria
              key={categoria.id_categoria}
              categoria={categoria}
              imagen={imagenDeCategoria(categoria.id_categoria)}
              activa={String(categoria.id_categoria) === String(idSeleccionada)}
            />
          ))}
        </div>

        {idSeleccionada && (
          <div className="text-center mt-3">
            <Link to="/categorias" className="btn btn-light btn-sm">Ver todas las categorías</Link>
          </div>
        )}

        <div id="productosCategorias">
          {error && <p className="text-danger mt-4">No se pudieron cargar las categorías.</p>}
          {!error && !cargando && idSeleccionada && categoriasAMostrar.length === 0 && (
            <p className="text-center text-white mt-4">La categoría no existe.</p>
          )}

          {!error &&
            categoriasAMostrar.map((categoria) => {
              const deEstaCategoria = productos.filter((p) => p.id_categoria === categoria.id_categoria)
              return (
                <div key={categoria.id_categoria}>
                  <h2 className="text-white mt-5 mb-3">{categoria.nombre_categoria}</h2>
                  <div className="row g-4">
                    {deEstaCategoria.length === 0 && (
                      <p className="text-white">No hay productos en esta categoría.</p>
                    )}
                    {deEstaCategoria.map((producto) => (
                      <TarjetaProducto
                        key={producto.id_producto}
                        producto={producto}
                        deshabilitado={contarEnCarrito(carrito, producto.id_producto) >= producto.stock}
                        onAgregar={() =>
                          agregar(carrito, producto.nombre, precioFinal(producto), producto.id_producto, producto.stock)
                        }
                      />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      <br />
    </div>
  )
}
