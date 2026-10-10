import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './views/Navbar'
import Footer from './views/Footer'

import Home from './views/home'
import Nosotros from './views/nosotros'
import Blogs from './views/blogs'
import DetalleBlog from './views/detalleBlog'
import Contacto from './views/contacto'
import Productos from './views/Productos'
import DetalleProducto from './views/detalleProducto'
import Login from './views/login'
import RegistroUsuario from './views/registroUsuario'
import Inventario from './views/inventario'
import NuevoProducto from './views/nuevoProducto'
import ModificarProducto from './views/modificarProducto'
import ListarUsuarios from './views/listarUsuarios'
import CrearUsuario from './views/crearUsuario'
import EditarUsuario from './views/editarUsuario'

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
        {}
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
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/nuevoProducto" element={<NuevoProducto />} />
          <Route path="/modificarProducto" element={<ModificarProducto />} />
          <Route path="/listarUsuarios" element={<ListarUsuarios />} />
          <Route path="/crearUsuario" element={<CrearUsuario />} />
          <Route path="/editarUsuario" element={<EditarUsuario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App