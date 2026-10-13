import { Link, useNavigate } from 'react-router-dom'
import { Offcanvas } from 'bootstrap'
import { quitar, useCarrito, vaciar } from './productos'
import { cerrarSesion, esAdmin, useUsuario } from '../services/sesion'
import CarritoLateral from './Carrito'

function MenuAdmin() {
  return (
    <ul className="navbar-nav me-auto" id="menuAdmin" style={{ display: 'flex' }}>
      <li className="nav-item"><Link className="nav-link" to="/admin">Dashboard</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/adminOrdenes">Órdenes</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/inventario">Productos</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/productosCriticos">Críticos</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/adminCategorias">Categorías</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/listarUsuarios">Usuarios</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/reportes">Reportes</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/perfil">Perfil</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/home">Tienda</Link></li>
    </ul>
  )
}

function MenuComprador({ conSesion }) {
  return (
    <ul className="navbar-nav me-auto align-items-center" id="menuComprador">
      <li className="nav-item"><Link className="nav-link" to="/home">Inicio</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/productos">Productos</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/categorias">Categorías</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/ofertas">Ofertas</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/nosotros">Nosotros</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/blogs">Blogs</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/contacto">Contacto</Link></li>
      {conSesion && <li className="nav-item"><Link className="nav-link" to="/perfil">Mi perfil</Link></li>}
    </ul>
  )
}

function Navbar() {
  const navigate = useNavigate()
  const carrito = useCarrito()
  const usuario = useUsuario()   // usuario guardado en localStorage
  const admin = esAdmin(usuario) // true solo si id_rol === 2

  const cerrar = () => {
    cerrarSesion()
    navigate('/home')
  }

  // "Ir a pagar": cierra el panel del carrito y va al checkout
  const irAPagar = () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío.')
      return
    }
    const panel = document.getElementById('carritoLateral')
    const instancia = panel && Offcanvas.getInstance(panel)
    if (instancia) instancia.hide()
    navigate('/checkout')
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/home">
            <img src="/img/s.jpg" alt="Logo" width="55" height="30" />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {admin ? <MenuAdmin /> : <MenuComprador conSesion={!!usuario} />}

            <div className="d-flex align-items-center mt-3 mt-lg-0">
              {!admin && (
                <button
                  className="btn btn-outline-dark position-relative me-3"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#carritoLateral"
                  aria-controls="carritoLateral"
                  id="btnCarrito"
                >
                  🛒 Carrito
                  <span id="contadorCarrito" className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {carrito.length}
                  </span>
                </button>
              )}
              {usuario ? (
                <button className="btn btn-outline-danger" id="btnCerrarSesion" onClick={cerrar}>
                  Cerrar sesión
                </button>
              ) : (
                <Link to="/login" className="btn btn-outline-primary" id="btnIniciarSesion">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!admin && (
        <CarritoLateral
          carrito={carrito}
          onQuitar={(i) => quitar(carrito, i)}
          onVaciar={vaciar}
          onPagar={irAPagar}
        />
      )}
    </>
  )
}

export default Navbar