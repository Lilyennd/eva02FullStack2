import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { agregar, precioFinal, useCarrito } from './productos'
import { apiFetch, urlImagen } from '../services/api'
import { esStaff, useUsuario } from '../services/sesion'

const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const rutaImagenProducto = (img) => urlImagen(img, 'productos')

export default function DetalleProducto() {
  // Lee el id desde la dirección: /producto/1 -> id = "1"
  const { id: idProducto } = useParams()
  const carrito = useCarrito()
  const usuario = useUsuario()
  const staff = esStaff(usuario)

  const [producto, setProducto] = useState(null)
  const [error, setError] = useState(false)

  // Cada vez que cambia el id, pide el producto al backend
  useEffect(() => {
    if (!idProducto) return

    // Evita actualizar la pantalla si ya se cambió de producto
    let vigente = true
    setProducto(null)
    setError(false)

    apiFetch('/api/productos/' + idProducto)
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

  // Texto del título según el estado
  let nombre = 'Cargando...'
  if (!idProducto) nombre = 'Producto no encontrado'
  else if (error) nombre = 'Error al cargar el producto'
  else if (producto) nombre = producto.nombre

  const p = producto || {}
  const hayStock = producto && producto.stock > 0

  return (
    <div className="bg-white min-vh-100">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-12 col-md-6">
            {producto && (
              <img
                id="detImagen"
                src={rutaImagenProducto(p.imagen_principal)}
                alt={p.nombre}
                className="img-fluid rounded shadow-sm border w-100"
                style={{ maxHeight: '450px', objectFit: 'contain' }}
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

            {!staff && (
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
            )}
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}