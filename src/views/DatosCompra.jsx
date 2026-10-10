export const formatearPrecio = (valor) => Number(valor).toLocaleString('es-CL')
const rutaImagenProducto = (img) => (img ? `/img/productos/${img}` : '/img/fondoaz.jpg')

// Campo de solo lectura (los datos grises de las figuras 7 y 8)
function CampoLectura({ id, etiqueta, valor, columnas = 'col-md-6' }) {
  return (
    <div className={`${columnas} mb-3`}>
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      <input type="text" className="form-control" id={id} value={valor || ''} readOnly />
    </div>
  )
}

// cliente = { nombre, apellidos, correo, calle, departamento, region, comuna, indicaciones, entrega? }
export function DatosCliente({ cliente }) {
  return (
    <>
      <div className="row">
        <CampoLectura id="nombre" etiqueta="Nombre" valor={cliente.nombre} columnas="col-md-4" />
        <CampoLectura id="apellidos" etiqueta="Apellidos" valor={cliente.apellidos} columnas="col-md-4" />
        <CampoLectura id="correo" etiqueta="Correo" valor={cliente.correo} columnas="col-md-4" />
      </div>

      <h5 className="fw-bold">Dirección de entrega de los productos</h5>
      <div className="row">
        <CampoLectura id="calle" etiqueta="Calle" valor={cliente.calle} />
        <CampoLectura id="departamento" etiqueta="Departamento (opcional)" valor={cliente.departamento} />
      </div>
      <div className="row">
        <CampoLectura id="region" etiqueta="Región" valor={cliente.region} />
        <CampoLectura id="comuna" etiqueta="Comuna" valor={cliente.comuna} />
      </div>
      <div className="mb-3">
        <label htmlFor="indicaciones" className="form-label">Indicaciones para la entrega (opcional)</label>
        <textarea className="form-control" id="indicaciones" rows="2" value={cliente.indicaciones || ''} readOnly />
      </div>
      {cliente.entrega && (
        <div className="row">
          <CampoLectura id="entrega" etiqueta="Opción de entrega" valor={cliente.entrega} columnas="col-12" />
        </div>
      )}
    </>
  )
}

// filas = [{ nombre, imagen, precio, cantidad, subtotal }]
export function TablaCompra({ filas, conImagen = true }) {
  return (
    <div className="table-responsive my-3">
      <table className="table align-middle">
        <thead>
          <tr>
            {conImagen && <th>Imagen</th>}
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i}>
              {conImagen && (
                <td>
                  <img
                    src={rutaImagenProducto(fila.imagen)}
                    alt=""
                    width="48"
                    height="48"
                    className="rounded"
                    style={{ objectFit: 'cover' }}
                  />
                </td>
              )}
              <td>{fila.nombre}</td>
              <td>${formatearPrecio(fila.precio)}</td>
              <td>{fila.cantidad}</td>
              <td>${formatearPrecio(fila.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
