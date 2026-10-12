import { useEffect, useState } from 'react'
import { agregar, contarEnCarrito, precioFinal, TarjetaProducto, useCarrito } from './productos'
import { apiFetch } from '../services/api'

// Vista Ofertas: solo los productos con en_oferta (GET /api/productos?oferta=1)
export default function Ofertas() {
  const carrito = useCarrito()
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch('/api/productos?oferta=1')
      .then((respuesta) => respuesta.json())
      .then((datos) => setProductos(Array.isArray(datos) ? datos : []))
      .catch((err) => {
        console.log('Error al traer las ofertas:', err)
        setError(true)
      })
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Ofertas</h1>
        <p className="text-center text-white mb-4">Aprovecha nuestras gemas con precio especial.</p>

        <div className="row g-4" id="listaOfertas">
          {error && <p className="text-danger">No se pudieron cargar las ofertas.</p>}
          {!error && !cargando && productos.length === 0 && (
            <p className="text-center text-white">Por ahora no hay productos en oferta.</p>
          )}
          {!error &&
            productos.map((producto) => (
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
