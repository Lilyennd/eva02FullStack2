import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// ================= CARRITO (equivale al carrito.js original) =================
// Mismas funciones y mismo localStorage ('carrito'). Va en este archivo para no
// crear uno nuevo; App.jsx (panel lateral) y DetalleProducto.jsx lo importan de aquí.
// El carrito vive en localStorage; useCarrito() lo lee y se actualiza solo,
// así el Navbar (panel lateral) y las vistas siempre muestran lo mismo.

const EVENTO_CARRITO = 'carrito-actualizado'

export function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || []
  } catch {
    return []
  }
}

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


export async function pagar(carrito) {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.')
    return carrito
  }

  const cantidades = {}
  carrito.forEach((p) => {
    cantidades[p.id_producto] = (cantidades[p.id_producto] || 0) + 1
  })

  let huboError = false
  try {
    for (const id in cantidades) {
      const respuesta = await fetch('/api/productos/' + id + '/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: cantidades[id] }),
      })
      if (!respuesta.ok) huboError = true
    }

    if (huboError) {
      alert('Hubo un problema con el stock de uno o más productos.')
      return carrito
    }

    alert('¡Compra realizada! Gracias por tu compra.')
    return vaciar()
  } catch (error) {
    console.log('Error al pagar:', error)
    alert('Hubo un problema al procesar el pago.')
    return carrito
  }
}

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const rutaImagenProducto = (img) => (img ? `/img/productos/${img}` : '/img/fondoaz.jpg')


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
          <p className="card-text fw-bold">${formatearPrecio(producto.precio)}</p>

          <div className="mt-auto d-flex gap-2">
            <Link
              to={`/detalleProducto?id=${producto.id_producto}`}
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
        <h1 className="text-center mb-4 ; herotitulo" style={{ color: 'white' }}>
          Nuestras gemas
        </h1>
        <div className="row g-4" id="listaProductos">
          {error && <p className="text-danger">No se pudieron cargar los productos.</p>}
          {!error &&
            productos.map((producto) => (
              <TarjetaProducto
                key={producto.id_producto}
                producto={producto}
                deshabilitado={contarEnCarrito(carrito, producto.id_producto) >= producto.stock}
                onAgregar={() =>
                  agregar(carrito, producto.nombre, producto.precio, producto.id_producto, producto.stock)
                }
              />
            ))}
        </div>
      </div>
      <br />
    </div>
  )
}

