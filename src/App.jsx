import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'

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
import GestionBlogs from './views/gestionBlogs'
import NuevoBlog from './views/nuevoBlog'
import ModificarBlog from './views/modificarBlog'
import ListarUsuarios from './views/listarUsuarios'
import CrearUsuario from './views/crearUsuario'
import EditarUsuario from './views/editarUsuario'
import Categorias from './views/categorias'
import Ofertas from './views/ofertas'
import Checkout from './views/checkout'
import PagoCorrecto from './views/pagoCorrecto'
import PagoError from './views/pagoError'
import RutaAdmin, { RutaPrivada, RutaStaff } from './views/RutaAdmin'
import AdminDashboard from './views/adminDashboard'
import AdminOrdenes from './views/adminOrdenes'
import MostrarBoleta from './views/mostrarBoleta'
import HistorialCompras from './views/historialCompras'
import ProductosCriticos from './views/productosCriticos'
import AdminCategorias from './views/adminCategorias'
import AdminContactos from './views/adminContactos'
import Reportes from './views/reportes'
import Perfil from './views/perfil'
import './assets/css/style.css'


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
          {/* Vistas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<DetalleBlog />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registroUsuario" element={<RegistroUsuario />} />
          {/* Sin id muestra todas las categorías; con id muestra solo esa */}
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/categorias/:id" element={<Categorias />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pagoCorrecto/:id" element={<PagoCorrecto />} />
          {/* Con id (orden creada) y sin id (error antes de crear la orden) */}
          <Route path="/pagoError" element={<PagoError />} />
          <Route path="/pagoError/:id" element={<PagoError />} />

          {/* Solo con sesión iniciada (cliente, vendedor o admin) */}
          <Route element={<RutaPrivada />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/editarUsuario/:id" element={<EditarUsuario />} />
            {/* Sin id es el historial propio; con id lo ve el admin de otro usuario */}
            <Route path="/historialCompras" element={<HistorialCompras />} />
            <Route path="/historialCompras/:id" element={<HistorialCompras />} />
            <Route path="/boleta/:id" element={<MostrarBoleta />} />
          </Route>

          {/* Staff: Administrador y Vendedor (id_rol 2 y 3) */}
          <Route element={<RutaStaff />}>
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/adminOrdenes" element={<AdminOrdenes />} />
          </Route>

          {/* Exclusivo Administrador (id_rol 2) */}
          <Route element={<RutaAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/nuevoProducto" element={<NuevoProducto />} />
            {/* Con id (desde inventario) y sin id (eliges en el desplegable) */}
            <Route path="/modificarProducto" element={<ModificarProducto />} />
            <Route path="/modificarProducto/:id" element={<ModificarProducto />} />
            <Route path="/productosCriticos" element={<ProductosCriticos />} />
            <Route path="/adminCategorias" element={<AdminCategorias />} />
            <Route path="/adminContactos" element={<AdminContactos />} />
            <Route path="/gestionBlogs" element={<GestionBlogs />} />
            <Route path="/nuevoBlog" element={<NuevoBlog />} />
            <Route path="/modificarBlog" element={<ModificarBlog />} />
            <Route path="/listarUsuarios" element={<ListarUsuarios />} />
            <Route path="/crearUsuario" element={<CrearUsuario />} />
            <Route path="/reportes" element={<Reportes />} />
          </Route>

          {/* Si la ruta no existe, vuelve al inicio */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App