import { useNavigate } from 'react-router-dom'
import { Offcanvas } from 'bootstrap'

function Carrito({ carrito, onQuitar, onVaciar, onPagar }) {
  const navigate = useNavigate()
  const total = carrito.reduce((suma, p) => suma + p.precio, 0)

  // Cierra el panel de Bootstrap y limpia capas oscuras residuales
  const cerrarMenuCarrito = () => {
    const panel = document.getElementById('carritoLateral')
    if (panel) {
      const instancia = Offcanvas.getInstance(panel) || new Offcanvas(panel)
      instancia.hide()
    }
    document.querySelectorAll('.offcanvas-backdrop, .modal-backdrop').forEach((el) => el.remove())
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }

  // Agrupa los productos del carrito para la simulación
  const agruparItems = (items) => {
    const agrupados = {}
    items.forEach((p, idx) => {
      const id = p.id_producto || idx + 1
      if (!agrupados[id]) {
        agrupados[id] = { id_producto: id, nombre: p.nombre, precio: Number(p.precio), cantidad: 0 }
      }
      agrupados[id].cantidad++
    })
    return Object.values(agrupados)
  }

  // Cierra el menú y va a la ruta requerida
  const irARuta = (ruta) => {
    cerrarMenuCarrito()
    navigate(ruta)
  }

  // Función para simular Pago Error con datos reales del carrito o de prueba
  const irAPagoErrorDemo = () => {
    cerrarMenuCarrito()

    const itemsDemo = carrito.length > 0
      ? agruparItems(carrito)
      : [{ id_producto: 1, nombre: 'Diamante Princesa 0.75ct', precio: 990000, cantidad: 1 }]

    const totalDemo = itemsDemo.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

    const respaldoDemo = {
      mensaje: 'Transacción rechazada por la entidad bancaria (Simulación de Error).',
      total: totalDemo,
      items: itemsDemo,
      datos: {
        nombre: 'Cliente',
        apellidos: 'Prueba',
        correo: 'cliente.prueba@ejemplo.cl',
        calle: 'Av. Siempre Viva 123',
        departamento: 'Depto 402',
        nombre_region: 'Región Metropolitana de Santiago',
        nombre_comuna: 'Santiago',
        indicaciones: 'Sin indicaciones especiales',
      }
    }

    sessionStorage.setItem('checkoutError', JSON.stringify(respaldoDemo))
    navigate('/pagoError')
  }

  return (
    <div 
      className="offcanvas offcanvas-end" 
      tabIndex={-1} 
      id="carritoLateral" 
      aria-labelledby="carritoLabel"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="carritoLabel">Tu Carrito 🛒</h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Cerrar"
        ></button>
      </div>

      <div className="offcanvas-body d-flex flex-column">
        {carrito.length === 0 ? (
          <p className="text-muted text-center my-auto">El carrito está vacío.</p>
        ) : (
          <ul id="listaCarrito" className="list-group mb-3">
            {carrito.map((producto, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{producto.nombre}</strong>
                </div>
                <span>
                  ${producto.precio.toLocaleString('es-CL')}
                  <button 
                    className="btn btn-sm btn-outline-danger ms-2" 
                    onClick={() => onQuitar(index)}
                    title="Quitar producto"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto border-top pt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0">Total:</h5>
            <h4 className="m-0 fw-bold text-success">
              $<span id="totalCarrito">{total.toLocaleString('es-CL')}</span>
            </h4>
          </div>

          <button 
            id="btnVaciar" 
            className="btn btn-outline-danger w-100 mb-2" 
            onClick={onVaciar}
            disabled={carrito.length === 0}
          >
            Vaciar Carrito
          </button>

          <button 
            className="btn btn-success w-100 mb-2 fw-bold" 
            id="btnPagar" 
            onClick={() => {
              cerrarMenuCarrito()
              onPagar()
            }}
          >
            Ir a Pagar
          </button>

          <button 
            className="btn btn-info text-white w-100 mb-3 fw-semibold" 
            id="btnDetalles"
            onClick={() => irARuta('/checkout')}
          >
            📋 Ver Detalles de la Compra
          </button>

          {/* Botones de Ejemplo / Prueba */}
          <div className="p-2 bg-light rounded border text-center">
            <small className="text-muted d-block mb-2 font-monospace"></small>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm btn-outline-success w-50" 
                id="btnDemoCorrecto"
                onClick={() => irARuta('/pagoCorrecto?id=1')}
              >
                ✔ Pago Correcto
              </button>
              <button 
                className="btn btn-sm btn-outline-success w-50" 
                id="btnDemoError"
                onClick={irAPagoErrorDemo}
              >
                ✖ Pago Error
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Carrito