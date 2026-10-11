import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './views/Navbar'
import Footer from './views/Footer'

import Home from './views/home'
import Nosotros from './views/nosotros'
import Blogs from './views/blogs'
import DetalleBlog from './views/detalleBlog'
import Contacto from './views/contacto'
import Productos from './views/productos'
import DetalleProducto from './views/detalleProducto'
import Login from './views/login'
import RegistroUsuario from './views/registroUsuario'
import Inventario from './views/inventario'
import NuevoProducto from './views/nuevoProducto'
import ModificarProducto from './views/modificarProducto'
import ListarUsuarios from './views/listarUsuarios'
import CrearUsuario from './views/crearUsuario'
import EditarUsuario from './views/editarUsuario'
import Categorias from './views/categorias'
import Ofertas from './views/ofertas'
import Checkout from './views/checkout'
import PagoCorrecto from './views/pagoCorrecto'
import PagoError from './views/pagoError'
import RutaAdmin from './views/RutaAdmin'
import AdminDashboard from './views/adminDashboard'
import AdminOrdenes from './views/adminOrdenes'
import MostrarBoleta from './views/mostrarBoleta'
import HistorialCompras from './views/historialCompras'
import ProductosCriticos from './views/productosCriticos'
import AdminCategorias from './views/adminCategorias'
import Perfil from './views/perfil'

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/detalleBlog" element={<DetalleBlog />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/detalleProducto" element={<DetalleProducto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registroUsuario" element={<RegistroUsuario />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pagoCorrecto" element={<PagoCorrecto />} />
          <Route path="/pagoError" element={<PagoError />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editarUsuario" element={<EditarUsuario />} />
          <Route path="/historialCompras" element={<HistorialCompras />} />

          {/* Vistas de administración: solo Administrador / Vendedor */}
          <Route element={<RutaAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/adminOrdenes" element={<AdminOrdenes />} />
            <Route path="/mostrarBoleta" element={<MostrarBoleta />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/nuevoProducto" element={<NuevoProducto />} />
            <Route path="/modificarProducto" element={<ModificarProducto />} />
            <Route path="/productosCriticos" element={<ProductosCriticos />} />
            <Route path="/adminCategorias" element={<AdminCategorias />} />
            <Route path="/listarUsuarios" element={<ListarUsuarios />} />
            <Route path="/crearUsuario" element={<CrearUsuario />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App