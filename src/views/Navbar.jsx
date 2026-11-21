import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Offcanvas } from 'bootstrap'
import { quitar, useCarrito, vaciar } from './productos'
import { cerrarSesion, esAdmin, esVendedor, esStaff, useUsuario } from '../services/sesion'
import CarritoLateral from './Carrito'

function MenuAdmin() {
  return (
    <ul className="navbar-nav me-auto" id="menuAdmin" style={{ display: 'flex' }}>
      <li className="nav-item"><NavLink className="nav-link" to="/admin">Dashboard</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/adminOrdenes">Órdenes</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/inventario">Productos</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/productosCriticos">Críticos</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/adminCategorias">Categorías</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/gestionBlogs">Blogs</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/listarUsuarios">Usuarios</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/reportes">Reportes</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/perfil">Perfil</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/home">Tienda</NavLink></li>
    </ul>
  )
}

function MenuVendedor() {
  return (
    <ul className="navbar-nav me-auto" id="menuVendedor" style={{ display: 'flex' }}>
      <li className="nav-item"><NavLink className="nav-link" to="/inventario">Productos</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/adminOrdenes">Órdenes</NavLink></li>
    </ul>
  )
}

function MenuComprador({ conSesion }) {
  return (
    <ul className="navbar-nav me-auto align-items-center" id="menuComprador">
      <li className="nav-item"><NavLink className="nav-link" to="/home">Inicio</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/productos">Productos</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/categorias">Categorías</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/ofertas">Ofertas</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/nosotros">Nosotros</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/blogs">Blogs</NavLink></li>
      <li className="nav-item"><NavLink className="nav-link" to="/contacto">Contacto</NavLink></li>
      {conSesion && <li className="nav-item"><NavLink className="nav-link" to="/perfil">Mi perfil</NavLink></li>}
    </ul>
  )
}

function Navbar() {
  const navigate = useNavigate()
  const carrito = useCarrito()
  const usuario = useUsuario()
  const admin = esAdmin(usuario)
  const vendedor = esVendedor(usuario)
  const staff = esStaff(usuario)

  const cerrar = () => {
    cerrarSesion()
    navigate('/home')
  }

  const irAPagar = () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío.')
      return
    }
    const panel = document.getElementById('carritoLateral')
    const instancia = panel && Offcanvas.getInstance(panel)
    if (instancia) instancia.hide()
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
    document.querySelectorAll('.offcanvas-backdrop').forEach((el) => el.remove())
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
            {admin ? <MenuAdmin /> : vendedor ? <MenuVendedor /> : <MenuComprador conSesion={!!usuario} />}

            <div className="d-flex align-items-center mt-3 mt-lg-0">
              {!staff && (
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

      {!staff && (
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
