import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { pagar, quitar, useCarrito, vaciar } from './Productos'
import CarritoLateral from './Carrito'

// ================= NAVBAR =================
// Misma clave de localStorage que usaba navbar.js
function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuarioActual'))
  } catch {
    return null
  }
}


const esAdmin = (usuario) => !!usuario && (usuario.id_rol === 1 || usuario.id_rol === 2)

function MenuAdmin() {
  return (
    <ul className="navbar-nav me-auto" id="menuAdmin" style={{ display: 'flex' }}>
      <li className="nav-item"><Link className="nav-link" to="/home">Home</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/inventario">Inventario</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/nuevoProducto">Nuevo producto</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/listarUsuarios">Usuarios</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/crearUsuario">Nuevo usuario</Link></li>
    </ul>
  )
}


function MenuComprador() {
  return (
    <ul className="navbar-nav me-auto align-items-center" id="menuComprador">
      <li className="nav-item"><Link className="nav-link" to="/home">Inicio</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/productos">Productos</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/nosotros">Nosotros</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/blogs">Blogs</Link></li>
      <li className="nav-item"><Link className="nav-link" to="/contacto">Contacto</Link></li>
    </ul>
  )
}


function Navbar() {
  const navigate = useNavigate()
  const carrito = useCarrito()
  const [, setRefrescar] = useState(0)

 
  const usuario = leerUsuario()
  const admin = esAdmin(usuario)

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActual')
    setRefrescar((n) => n + 1)
    navigate('/home')
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
            {admin ? <MenuAdmin /> : <MenuComprador />}

            <div className="d-flex align-items-center mt-3 mt-lg-0">
              {}
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
                <button className="btn btn-outline-danger" id="btnCerrarSesion" onClick={cerrarSesion}>
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
          onPagar={() => pagar(carrito)}
        />
      )}
    </>
  )
}

export default Navbar
