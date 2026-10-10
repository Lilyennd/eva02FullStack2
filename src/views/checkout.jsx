import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito, vaciar } from './productos'
import { formatearPrecio, TablaCompra } from './DatosCompra'

// checkout: resumen del carrito + datos del cliente + dirección de entrega.
// crea la orden (POST /api/ordenes) y simula el pago marcándola como 'Pagada'
// (PUT /api/ordenes/:id, que además descuenta el stock). Si algo falla -> /pagoError

function leerUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuarioActual'))
  } catch {
    return null
  }
}

// Cada click en "Agregar" es una unidad en el carrito: aquí se agrupan por producto
export function agruparCarrito(carrito) {
  const agrupados = {}
  carrito.forEach((p) => {
    if (!agrupados[p.id_producto]) {
      agrupados[p.id_producto] = {
        id_producto: p.id_producto,
        nombre: p.nombre,
        precio: Number(p.precio),
        cantidad: 0,
      }
    }
    agrupados[p.id_producto].cantidad++
  })
  return Object.values(agrupados)
}

export default function Checkout() {
  const navigate = useNavigate()
  const carrito = useCarrito()
  const usuario = leerUsuario()

  // ----- estado del formulario -----
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    apellidos: usuario?.apellidos || '',
    correo: usuario?.correo || '',
    calle: '',
    departamento: '',
    indicaciones: '',
    entrega: 'Despacho',
  })
  const [idRegion, setIdRegion] = useState('')
  const [idComuna, setIdComuna] = useState('')
  const [regiones, setRegiones] = useState([])
  const [comunas, setComunas] = useState([])
  const [imagenes, setImagenes] = useState({})
  const [validado, setValidado] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const items = agruparCarrito(carrito)
  const total = items.reduce((suma, i) => suma + i.precio * i.cantidad, 0)

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // regiones + imágenes de los productos (el carrito solo guarda nombre, precio e id)
  useEffect(() => {
    fetch('/api/regiones')
      .then((r) => r.json())
      .then(setRegiones)
      .catch((err) => console.error('Error cargando regiones:', err))

    fetch('/api/productos')
      .then((r) => r.json())
      .then((productos) => {
        const mapa = {}
        productos.forEach((p) => { mapa[p.id_producto] = p.imagen_principal })
        setImagenes(mapa)
      })
      .catch((err) => console.log('No se pudieron traer las imágenes:', err))
  }, [])

  // comunas de la región elegida
  useEffect(() => {
    if (!idRegion) return
    let vigente = true
    fetch('/api/comunas?regionId=' + idRegion)
      .then((r) => r.json())
      .then((lista) => { if (vigente) setComunas(lista) })
      .catch((err) => console.error('Error cargando comunas:', err))
    return () => { vigente = false }
  }, [idRegion])

  // si inició sesión, la dirección se rellena sola
  const idUsuario = usuario?.id_usuario
  useEffect(() => {
    if (!idUsuario) return
    fetch('/api/usuarios/' + idUsuario)
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (!u) return
        setForm((anterior) => ({ ...anterior, calle: u.direccion || '' }))
        if (u.id_region) setIdRegion(String(u.id_region))
        if (u.id_comuna) setIdComuna(String(u.id_comuna))
      })
      .catch((err) => console.log('No se pudo traer la dirección del usuario:', err))
  }, [idUsuario])

  const cambiarRegion = (e) => {
    setIdRegion(e.target.value)
    setIdComuna('')
    setComunas([])
  }

  const pagar = async (e) => {
    e.preventDefault()

    if (!e.currentTarget.checkValidity()) {
      setValidado(true)
      return
    }

    const nombreRegion = regiones.find((r) => String(r.id_region) === idRegion)?.nombre_region || ''
    const nombreComuna = comunas.find((c) => String(c.id_comuna) === idComuna)?.nombre_comuna || ''

    const datos = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim(),
      calle: form.calle.trim(),
      departamento: form.departamento.trim(),
      id_region: idRegion,
      id_comuna: idComuna,
      indicaciones: form.indicaciones.trim(),
      opcion_entrega: form.entrega,
      id_usuario: usuario ? usuario.id_usuario : null,
      items: items.map((i) => ({ id_producto: i.id_producto, cantidad: i.cantidad })),
    }

    // se guarda por si el pago falla (lo usa PagoError)
    const respaldo = {
      mensaje: '',
      total,
      items,
      datos: { ...datos, nombre_region: nombreRegion, nombre_comuna: nombreComuna },
    }
    const irAError = (mensaje, idOrden) => {
      respaldo.mensaje = mensaje
      sessionStorage.setItem('checkoutError', JSON.stringify(respaldo))
      navigate(idOrden ? '/pagoError?id=' + idOrden : '/pagoError')
    }

    setProcesando(true)
    try {
      // a) crear la orden (el servidor valida stock y precios)
      const resOrden = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const orden = await resOrden.json()
      if (!resOrden.ok) {
        irAError(orden.error || 'No se pudo crear la orden.')
        return
      }

      // b) pago simulado: la orden pasa a 'Pagada' y se descuenta el stock
      const resPago = await fetch('/api/ordenes/' + orden.id_orden, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Pagada' }),
      })
      if (!resPago.ok) {
        const errorPago = await resPago.json()
        await fetch('/api/ordenes/' + orden.id_orden, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: 'Pago fallido' }),
        })
        irAError(errorPago.error || 'El pago fue rechazado.', orden.id_orden)
        return
      }

      // c) todo bien: se vacía el carrito y se muestra la boleta
      sessionStorage.removeItem('checkoutError')
      vaciar()
      navigate('/pagoCorrecto?id=' + orden.id_orden)
    } catch (err) {
      console.log('Error en el pago:', err)
      irAError('No se pudo conectar con el servidor.')
    } finally {
      setProcesando(false)
    }
  }

  // ----- carrito vacío -----
  if (carrito.length === 0) {
    return (
      <div className="background min-vh-100">
        <div className="container my-5 text-center text-white">
          <h2 className="mb-3">Tu carrito está vacío</h2>
          <Link to="/productos" className="btn btn-light">Ver productos</Link>
        </div>
      </div>
    )
  }

  const filas = items.map((i) => ({
    nombre: i.nombre,
    imagen: imagenes[i.id_producto],
    precio: i.precio,
    cantidad: i.cantidad,
    subtotal: i.precio * i.cantidad,
  }))

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex flex-wrap justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="fw-bold mb-1">Carrito de compra</h3>
                    <p className="text-muted mb-0">Completa la siguiente información</p>
                  </div>
                  <span className="badge bg-primary fs-6 mt-2 mt-md-0">
                    Total a pagar: ${formatearPrecio(total)}
                  </span>
                </div>

                <TablaCompra filas={filas} />

                <form id="formCheckout" noValidate className={validado ? 'was-validated' : ''} onSubmit={pagar}>
                  <h5 className="fw-bold">Información del cliente</h5>
                  <p className="text-muted">Completa la siguiente información</p>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" id="nombre" name="nombre" maxLength="50"
                        value={form.nombre} onChange={cambiar} required />
                      <div className="invalid-feedback">Ingresa tu nombre.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="apellidos" className="form-label">Apellidos <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" id="apellidos" name="apellidos" maxLength="100"
                        value={form.apellidos} onChange={cambiar} required />
                      <div className="invalid-feedback">Ingresa tus apellidos.</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="correo" className="form-label">Correo <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" id="correo" name="correo" maxLength="100"
                      placeholder="nombre@dominio.cl" value={form.correo} onChange={cambiar} required />
                    <div className="invalid-feedback">Ingresa un correo válido.</div>
                  </div>

                  <h5 className="fw-bold">Dirección de entrega de los productos</h5>
                  <p className="text-muted">Ingrese dirección de forma detallada</p>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="calle" className="form-label">Calle <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" id="calle" name="calle" maxLength="150"
                        value={form.calle} onChange={cambiar} required />
                      <div className="invalid-feedback">Ingresa la calle.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="departamento" className="form-label">Departamento (opcional)</label>
                      <input type="text" className="form-control" id="departamento" name="departamento" maxLength="30"
                        placeholder="Ej: 603" value={form.departamento} onChange={cambiar} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="region" className="form-label">Región <span className="text-danger">*</span></label>
                      <select className="form-select" id="region" value={idRegion} onChange={cambiarRegion} required>
                        <option value="">Seleccionar región</option>
                        {regiones.map((r) => (
                          <option key={r.id_region} value={r.id_region}>{r.nombre_region}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">Selecciona una región.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="comuna" className="form-label">Comuna <span className="text-danger">*</span></label>
                      <select className="form-select" id="comuna" value={idComuna} disabled={!idRegion}
                        onChange={(e) => setIdComuna(e.target.value)} required>
                        <option value="">Seleccionar comuna</option>
                        {comunas.map((c) => (
                          <option key={c.id_comuna} value={c.id_comuna}>{c.nombre_comuna}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">Selecciona una comuna.</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="indicaciones" className="form-label">Indicaciones para la entrega (opcional)</label>
                    <textarea className="form-control" id="indicaciones" name="indicaciones" rows="2" maxLength="255"
                      placeholder="Ej: Entre calles, color del edificio, no tiene timbre."
                      value={form.indicaciones} onChange={cambiar} />
                  </div>

                  <div className="mb-4">
                    <label className="form-label d-block">Opción de entrega</label>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="entrega" id="entregaDespacho"
                        value="Despacho" checked={form.entrega === 'Despacho'} onChange={cambiar} />
                      <label className="form-check-label" htmlFor="entregaDespacho">Despacho a domicilio</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="entrega" id="entregaRetiro"
                        value="Retiro en tienda" checked={form.entrega === 'Retiro en tienda'} onChange={cambiar} />
                      <label className="form-check-label" htmlFor="entregaRetiro">Retiro en tienda</label>
                    </div>
                  </div>

                  <div className="text-end">
                    <button type="submit" className="btn btn-success btn-lg" id="btnPagarAhora" disabled={procesando}>
                      {procesando ? 'Procesando pago...' : 'Pagar ahora $' + formatearPrecio(total)}
                    </button>
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
