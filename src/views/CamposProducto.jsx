import { useEffect, useState } from 'react'
import { categoriasApi } from '../services/api'

// Imágenes disponibles en el backend (public/img/productos). Una sola lista para Nuevo y Modificar.
export const IMAGENES_PRODUCTO = [
  'diamante1.jpg', 'diamanterosa1.jpg', 'diamanterojo.jpg', 'diamond.jpg',
  'esmeralda1.jpg', 'ruby1.jpg', 'zafiro1.jpg', 'images.jpg',
]

// Hook: carga las categorías desde el backend (GET /api/categorias)
// y entrega la lista de imágenes disponibles en /public/img/productos.
export function useCatalogosProducto(imagenesBase = []) {
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    let vigente = true
    categoriasApi
      .listar()
      .then((lista) => {
        if (vigente) setCategorias(Array.isArray(lista) ? lista : [])
      })
      .catch((err) => console.log('Error al traer las categorías:', err))
    return () => {
      vigente = false
    }
  }, [])

  return { categorias, imagenes: imagenesBase }
}

// Campos del formulario de producto, compartidos por Nuevo y Modificar producto.
// El id de cada input es la clave dentro de `datos` (handleChange usa e.target.id).
export default function CamposProducto({
  datos,
  onChange,
  categorias = [],
  imagenes = [],
  conCodigo = false,
  stepPrecio = '1',
}) {
  return (
    <>
      {conCodigo && (
        <div className="mb-3">
          <label htmlFor="codigo_producto" className="form-label">Código *</label>
          <input id="codigo_producto" className="form-control" maxLength={50}
            value={datos.codigo_producto} onChange={onChange} />
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="nombre" className="form-label">Nombre *</label>
        <input id="nombre" className="form-control" maxLength={100}
          value={datos.nombre} onChange={onChange} />
      </div>

      <div className="mb-3">
        <label htmlFor="descripcion" className="form-label">Descripción</label>
        <textarea id="descripcion" className="form-control" rows={2}
          value={datos.descripcion} onChange={onChange} />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="precio" className="form-label">Precio *</label>
          <input id="precio" type="number" min="0" step={stepPrecio} className="form-control"
            value={datos.precio} onChange={onChange} />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="id_categoria" className="form-label">Categoría *</label>
          <select id="id_categoria" className="form-select"
            value={datos.id_categoria} onChange={onChange}>
            <option value="">Selecciona...</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="stock" className="form-label">Stock *</label>
          <input id="stock" type="number" min="0" step="1" className="form-control"
            value={datos.stock} onChange={onChange} />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="stock_critico" className="form-label">Stock crítico</label>
          <input id="stock_critico" type="number" min="0" step="1" className="form-control"
            value={datos.stock_critico} onChange={onChange} />
        </div>
      </div>

      <div className="row align-items-end">
        <div className="col-md-6 mb-3">
          <div className="form-check">
            <input id="en_oferta" type="checkbox" className="form-check-input"
              checked={!!datos.en_oferta}
              onChange={(e) => onChange({ target: { id: 'en_oferta', value: e.target.checked } })} />
            <label htmlFor="en_oferta" className="form-check-label">Producto en oferta</label>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="precio_oferta" className="form-label">Precio de oferta</label>
          <input id="precio_oferta" type="number" min="0" step={stepPrecio} className="form-control"
            disabled={!datos.en_oferta} value={datos.precio_oferta} onChange={onChange} />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="origen" className="form-label">Origen</label>
          <input id="origen" className="form-control" value={datos.origen} onChange={onChange} />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="imagen_principal" className="form-label">Imagen</label>
          <select id="imagen_principal" className="form-select"
            value={datos.imagen_principal} onChange={onChange}>
            <option value="">Sin imagen</option>
            {imagenes.map((img) => (
              <option key={img} value={img}>{img}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label htmlFor="kilates" className="form-label">Kilates</label>
          <input id="kilates" className="form-control" value={datos.kilates} onChange={onChange} />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="corte" className="form-label">Corte</label>
          <input id="corte" className="form-control" value={datos.corte} onChange={onChange} />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="claridad" className="form-label">Claridad</label>
          <input id="claridad" className="form-control" value={datos.claridad} onChange={onChange} />
        </div>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label htmlFor="color" className="form-label">Color</label>
          <input id="color" className="form-control" value={datos.color} onChange={onChange} />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="certificado" className="form-label">Certificado</label>
          <input id="certificado" className="form-control" value={datos.certificado} onChange={onChange} />
        </div>
        <div className="col-md-4 mb-3">
          <label htmlFor="peso_gramos" className="form-label">Peso (g)</label>
          <input id="peso_gramos" type="number" min="0" step="0.01" className="form-control"
            value={datos.peso_gramos} onChange={onChange} />
        </div>
      </div>
    </>
  )
}
