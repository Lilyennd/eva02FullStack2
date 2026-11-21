import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiFetch, urlImagen } from '../services/api'


const EVENTO_CARRITO = 'carrito-actualizado'

// Lee el carrito guardado en el navegador (si no hay nada, devuelve una lista vacía)
export function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || []
  } catch {
    return []
  }
}

// Guarda el carrito y avisa a las demás partes de la página que cambió
function guardarCarrito(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito))
  window.dispatchEvent(new Event(EVENTO_CARRITO)) 
}


export function useCarrito() {
  const [carrito, setCarrito] = useState(leerCarrito)

  useEffect(() => {
    const sincronizar = () => setCarrito(leerCarrito())
    window.addEventListener(EVENTO_CARRITO, sincronizar)
    window.addEventListener('storage', sincronizar) // cambios desde otra pestaña
    return () => {
      window.removeEventListener(EVENTO_CARRITO, sincronizar)
      window.removeEventListener('storage', sincronizar)
    }
  }, [])

  return carrito
}

// Cuenta cuántas unidades de un producto hay en el carrito
export function contarEnCarrito(carrito, id_producto) {
  return carrito.filter((p) => p.id_producto === id_producto).length
}

// Devuelve el carrito nuevo (o el mismo si ya no queda stock)
export function agregar(carrito, nombre, precio, id_producto, stock) {
  if (contarEnCarrito(carrito, id_producto) >= stock) {
    alert('No queda más stock de ' + nombre)
    return carrito
  }
  const nuevo = [...carrito, { nombre, precio, id_producto }]
  guardarCarrito(nuevo)
  return nuevo
}

export function quitar(carrito, index) {
  const nuevo = carrito.filter((_, i) => i !== index)
  guardarCarrito(nuevo)
  return nuevo
}

export function vaciar() {
  guardarCarrito([])
  return []
}


const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')

// BD: productos.en_oferta + productos.precio_oferta. Si está en oferta se cobra el precio de oferta.
export const precioFinal = (producto) =>
  producto.en_oferta && producto.precio_oferta ? Number(producto.precio_oferta) : Number(producto.precio)
const rutaImagenProducto = (img) => urlImagen(img, 'productos')

// Filtra productos por nombre, origen, corte, color o descripción (insensible a tildes y mayúsculas)
const normalizar = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function filtrarProductos(productos, busqueda) {
  const t = normalizar(busqueda)
  if (!t) return productos
  return productos.filter((p) => {
    const textoProducto = [p.nombre, p.origen, p.corte, p.color, p.descripcion]
      .map(normalizar)
      .join(' ')
    return textoProducto.includes(t)
  })
}


export function TarjetaProducto({ producto, deshabilitado, onAgregar }) {
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
          <p className="card-text text-muted">{producto.origen ? producto.origen : ''}</p>
          <p className="card-text fw-bold">
            {precioFinal(producto) < Number(producto.precio) ? (
              <>
                <span className="badge bg-danger me-1">Oferta</span>
                <span className="text-muted text-decoration-line-through me-1">
                  ${formatearPrecio(producto.precio)}
                </span>
              </>
            ) : null}
            ${formatearPrecio(precioFinal(producto))}
          </p>

          <div className="mt-auto d-flex gap-2">
            {/* Lleva a /producto/1, /producto/2, etc. (coincide con la ruta de App.jsx) */}
            <Link
              to={`/producto/${producto.id_producto}`}
              className="btn btn-outline-dark flex-fill"
            >
              Ver detalle
            </Link>
            <button
              id={`btnAgregar${producto.id_producto}`}
              onClick={onAgregar}
              disabled={deshabilitado}
              className="btn btn-success flex-fill"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Productos() {
  const carrito = useCarrito()
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState(() => searchParams.get('q') || '')
  const [error, setError] = useState(false)

  // Sincroniza si se busca desde la barra superior (Navbar)
  useEffect(() => {
    setBusqueda(searchParams.get('q') || '')
  }, [searchParams])

  // Al cargar la página, pide la lista de productos al backend
  useEffect(() => {
    apiFetch('/api/productos')
      .then((respuesta) => respuesta.json())
      .then(setProductos)
      .catch((err) => {
        console.log('Error al traer los productos:', err)
        setError(true)
      })
  }, [])

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor)
    if (valor.trim()) {
      setSearchParams({ q: valor }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  const productosFiltrados = filtrarProductos(productos, busqueda)

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>
          Nuestras gemas
        </h1>

        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="input-group">
              <input
                type="search"
                id="buscadorProductos"
                className="form-control"
                aria-label="Buscar productos"
                placeholder="Buscar gema por nombre, origen, corte o color..."
                value={busqueda}
                onChange={(e) => cambiarBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => cambiarBusqueda('')}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4" id="listaProductos">
          {error && <p className="text-danger">No se pudieron cargar los productos.</p>}
          {!error && productos.length > 0 && productosFiltrados.length === 0 && (
            <p className="text-center text-white">
              No se encontraron gemas que coincidan con "{busqueda}".
            </p>
          )}
          {!error &&
            productosFiltrados.map((producto) => (
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
      <br />
    </div>
  )
}