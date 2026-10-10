function Carrito({ carrito, onQuitar, onVaciar, onPagar }) {
  const total = carrito.reduce((suma, p) => suma + p.precio, 0)

  return (
    <div className="offcanvas offcanvas-end" tabIndex={-1} id="carritoLateral" aria-labelledby="carritoLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="carritoLabel">Tu Carrito 🛒</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
      </div>
      <div className="offcanvas-body d-flex flex-column">
        <ul id="listaCarrito" className="list-group mb-3">
          {carrito.map((producto, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              {producto.nombre}
              <span>
                ${producto.precio}
                <button className="btn btn-sm btn-danger ms-2" onClick={() => onQuitar(index)}>X</button>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-top pt-3">
          <h4>Total: $<span id="totalCarrito">{total}</span></h4>
          <button id="btnVaciar" className="btn btn-outline-danger w-100 mb-2" onClick={onVaciar}>Vaciar Carrito</button>
          <button className="btn btn-success w-100" id="btnPagar" onClick={onPagar}>Ir a pagar</button>
        </div>
      </div>
    </div>
  )
}

export default Carrito