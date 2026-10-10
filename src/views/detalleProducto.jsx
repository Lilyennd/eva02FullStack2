import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { agregar, precioFinal, useCarrito } from './Productos'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const rutaImagenProducto = (img) => (img ? `/img/productos/${img}` : '/img/fondoaz.jpg')


export default function DetalleProducto() {
  const [params] = useSearchParams()
  const idProducto = params.get('id')
  const carrito = useCarrito()

  const [producto, setProducto] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!idProducto) return

    let vigente = true
    fetch('/api/productos/' + idProducto)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error('Producto no encontrado (' + respuesta.status + ')')
        return respuesta.json()
      })
      .then((datos) => {
        if (vigente) setProducto(datos)
      })
      .catch((err) => {
        console.log('Error al traer el producto:', err)
        if (vigente) setError(true)
      })

    return () => {
      vigente = false
    }
  }, [idProducto])

  let nombre = 'Cargando...'
  if (!idProducto) nombre = 'Producto no encontrado'
  else if (error) nombre = 'Error al cargar el producto'
  else if (producto) nombre = producto.nombre

  const p = producto || {}
  const hayStock = producto && producto.stock > 0

  return (
    <div className="min-vh-100">
      <div className="container my-5">
        <div className="row g-5">
          <div className="col-12 col-md-6">
            {producto && (
              <img
                id="detImagen"
                src={rutaImagenProducto(p.imagen_principal)}
                alt={p.nombre}
                className="img-fluid rounded"
              />
            )}
          </div>
          <div className="col-12 col-md-6">
            <h1 id="detNombre">{nombre}</h1>
            <p className="text-muted" id="detOrigen">{p.origen || ''}</p>
            <h3 className="fw-bold" id="detPrecio">
              {producto && precioFinal(p) < Number(p.precio) && (
                <>
                  <span className="badge bg-danger fs-6 me-2">Oferta</span>
                  <span className="text-muted fs-5 text-decoration-line-through me-2">
                    ${formatearPrecio(p.precio)}
                  </span>
                </>
              )}
              {producto ? '$' + formatearPrecio(precioFinal(p)) : ''}
            </h3>
            <p id="detDescripcion">{p.descripcion || ''}</p>
            <ul className="list-group list-group-flush mb-4">
              <li className="list-group-item"><strong>Kilates:</strong> <span id="detKilates">{producto ? p.kilates || '-' : ''}</span></li>
              <li className="list-group-item"><strong>Corte:</strong> <span id="detCorte">{producto ? p.corte || '-' : ''}</span></li>
              <li className="list-group-item"><strong>Claridad:</strong> <span id="detClaridad">{producto ? p.claridad || '-' : ''}</span></li>
              <li className="list-group-item"><strong>Color:</strong> <span id="detColor">{producto ? p.color || '-' : ''}</span></li>
              <li className="list-group-item"><strong>Certificado:</strong> <span id="detCertificado">{producto ? p.certificado || '-' : ''}</span></li>
              <li className="list-group-item"><strong>Stock disponible:</strong> <span id="detStock">{producto ? p.stock : ''}</span></li>
            </ul>
            <button
              className="btn btn-dark btn-lg"
              id="btnAgregarDetalle"
              disabled={producto ? !hayStock : false}
              onClick={() => {
                if (hayStock) agregar(carrito, p.nombre, precioFinal(p), p.id_producto, p.stock)
              }}
            >
              {producto && !hayStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}