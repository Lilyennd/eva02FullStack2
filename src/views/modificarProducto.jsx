import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'



const IMAGENES_BASE = [
  'diamante1.jpg', 'diamanterosa1.jpg', 'esmeralda1.jpg', 'ruby1.jpg', 'zafiro1.jpg',
]

const productoVacio = {
  codigo_producto: '', nombre: '', descripcion: '', precio: '', id_categoria: '',
  stock: '', stock_critico: '', origen: '', imagen_principal: '',
  kilates: '', corte: '', claridad: '', color: '', certificado: '', peso_gramos: '',
}

export default function ModificarProducto() {
  const navigate = useNavigate()
  const { categorias, imagenes } = useCatalogosProducto(IMAGENES_BASE)
  const [listaProductos, setListaProductos] = useState([])
  const [idSeleccionado, setIdSeleccionado] = useState('')
  const [datos, setDatos] = useState(productoVacio)

  useEffect(() => {
    let vigente = true
    fetch('/api/productos')
      .then((respuesta) => respuesta.json())
      .then((lista) => {
        if (vigente) setListaProductos(lista)
      })
      .catch(() => {
        if (vigente) alert('Error al cargar los productos desde la base de datos.')
      })
    return () => {
      vigente = false
    }
  }, [])

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
  }

  const handleSeleccion = (e) => {
    const id = e.target.value
    setIdSeleccionado(id)

    const elegido = listaProductos.find((p) => p.id_producto == id)
    if (elegido) {
      setDatos({
        codigo_producto: elegido.codigo_producto,
        nombre: elegido.nombre,
        descripcion: elegido.descripcion || '',
        precio: elegido.precio,
        stock: elegido.stock,
        stock_critico: elegido.stock_critico || 0,
        id_categoria: elegido.id_categoria,
        imagen_principal: elegido.imagen_principal || '',
        origen: elegido.origen || '',
        kilates: elegido.kilates || '',
        corte: elegido.corte || '',
        claridad: elegido.claridad || '',
        color: elegido.color || '',
        certificado: elegido.certificado || '',
        peso_gramos: elegido.peso_gramos || '',
      })
    }
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault()

    if (idSeleccionado === '') {
      alert('Por favor, selecciona un producto primero.')
      return
    }

    const paqueteDatos = {
      nombre: datos.nombre,
      descripcion: datos.descripcion || null,
      precio: Number(datos.precio),
      stock: Number(datos.stock),
      stock_critico: Number(datos.stock_critico),
      id_categoria: Number(datos.id_categoria),
      origen: datos.origen || null,
      kilates: datos.kilates || null,
      corte: datos.corte || null,
      claridad: datos.claridad || null,
      color: datos.color || null,
      certificado: datos.certificado || null,
      peso_gramos: Number(datos.peso_gramos) || null,
      imagen_principal: datos.imagen_principal || null,
    }

    try {
      const respuesta = await fetch('/api/productos/' + idSeleccionado, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paqueteDatos),
      })

      if (respuesta.ok) {
        alert('El producto se actualizó correctamente')
        navigate('/inventario')
      } else {
        alert('Hubo un problema al guardar en la base de datos.')
      }
    } catch {
      alert('Error de conexión con el servidor.')
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container">
        <div className="row justify-content-center py-5">
          <div className="col-md-9 col-lg-7">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title text-center mb-4 fw-bold">Modificar Producto</h3>
                <div id="mensajeProducto"></div>
                <form id="formProducto" noValidate onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="select_producto" className="form-label">Seleccionar Producto a Modificar</label>
                    <select className="form-select bg-light fw-bold" id="select_producto" required
                      value={idSeleccionado} onChange={handleSeleccion}>
                      <option value="" disabled>Cargando productos...</option>
                      {listaProductos.map((p) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.codigo_producto + ' - ' + p.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">Elige el producto que deseas actualizar.</div>
                  </div>

                  <CamposProducto
                    datos={datos}
                    onChange={handleChange}
                    categorias={categorias}
                    imagenes={imagenes}
                    stepPrecio="100000"
                  />

                  <div className="d-flex gap-2 mt-3">
                    <button type="submit" className="btn btn-dark flex-fill py-2">Modificar Producto</button>
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