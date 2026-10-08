import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const IMAGENES_BASE = [
  'diamante1.jpg', 'diamanterosa1.jpg', 'esmeralda1.jpg',
  'ruby1.jpg', 'zafiro1.jpg', 'diamanterojo.jpg',
]

const productoVacio = {
  codigo_producto: '', nombre: '', descripcion: '', precio: '', id_categoria: '',
  stock: '', stock_critico: '', origen: '', imagen_principal: '',
  kilates: '', corte: '', claridad: '', color: '', certificado: '', peso_gramos: '',
}

export default function NuevoProducto() {
  const navigate = useNavigate()
  const { categorias, imagenes } = useCatalogosProducto(IMAGENES_BASE)
  const [datos, setDatos] = useState(productoVacio)

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()

    const codigo = datos.codigo_producto.trim()
    const nombre = datos.nombre.trim()
    const { precio, stock, id_categoria: categoria } = datos

    if (codigo === '' || codigo.length < 3) {
      alert('El código del producto es obligatorio y debe tener al menos 3 letras/números.')
      return
    }
    if (nombre === '') {
      alert('El nombre del producto es obligatorio.')
      return
    }
    if (precio === '' || Number(precio) < 0) {
      alert('El precio debe ser un número igual o mayor a cero.')
      return
    }
    if (categoria === '') {
      alert('Debes seleccionar una categoría para el producto.')
      return
    }
    if (stock === '' || Number(stock) < 0 || !Number.isInteger(Number(stock))) {
      alert('El stock debe ser un número entero (0, 1, 2...). No puede ser negativo.')
      return
    }

    const nuevoProducto = {
      codigo_producto: codigo,
      nombre,
      descripcion: datos.descripcion.trim() || null,
      precio: Number(precio),
      stock: Number(stock),
      stock_critico: Number(datos.stock_critico) || 0,
      id_categoria: Number(categoria),
      origen: datos.origen.trim() || null,
      kilates: datos.kilates.trim() || null,
      corte: datos.corte.trim() || null,
      claridad: datos.claridad.trim() || null,
      color: datos.color.trim() || null,
      certificado: datos.certificado.trim() || null,
      peso_gramos: Number(datos.peso_gramos) || null,
      imagen_principal: datos.imagen_principal || null,
    }

    try {
      const respuesta = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto),
      })

      if (respuesta.ok) {
        alert('¡Producto creado con éxito!')
        navigate('/inventario')
      } else {
        const datosError = await respuesta.json()
        alert('Error al crear: ' + (datosError.error || 'Problema en el servidor'))
      }
    } catch {
      alert('Error de red: No se pudo conectar con el servidor.')
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container">
        <div className="row justify-content-center py-5">
          <div className="col-md-9 col-lg-7">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title text-center mb-4 fw-bold">Nuevo Producto</h3>
                <div id="mensajeProducto"></div>
                <form id="formProducto" noValidate onSubmit={handleSubmit}>
                  <CamposProducto
                    datos={datos}
                    onChange={handleChange}
                    categorias={categorias}
                    imagenes={imagenes}
                    conCodigo
                    stepPrecio="0.01"
                  />
                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-dark flex-fill py-2">Guardar producto</button>
                    <Link to="/inventario" className="btn btn-outline-secondary flex-fill py-2 text-center">Cancelar</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}
