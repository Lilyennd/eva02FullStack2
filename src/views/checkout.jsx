import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCarrito, vaciar } from './productos'
import { formatearPrecio, TablaCompra } from './DatosCompra'
import { apiFetch } from '../services/api'
import { useUsuario } from '../services/sesion'


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
  const usuario = useUsuario()

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

  // regiones + imágenes de los productos
  useEffect(() => {
    apiFetch('/api/regiones')
      .then((r) => r.json())
      .then(setRegiones)
      .catch((err) => console.error('Error cargando regiones:', err))

    apiFetch('/api/productos')
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
    apiFetch('/api/comunas?regionId=' + idRegion)
      .then((r) => r.json())
      .then((lista) => { if (vigente) setComunas(lista) })
      .catch((err) => console.error('Error cargando comunas:', err))
    return () => { vigente = false }
  }, [idRegion])

  // si inició sesión, la dirección se rellena sola
  const idUsuario = usuario?.id_usuario
  useEffect(() => {
    if (!idUsuario) return
    apiFetch('/api/usuarios/' + idUsuario)
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
      const resOrden = await apiFetch('/api/ordenes', {
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
      const resPago = await apiFetch('/api/ordenes/' + orden.id_orden, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Pagada' }),
      })
      if (!resPago.ok) {
        const errorPago = await resPago.json()
        await apiFetch('/api/ordenes/' + orden.id_orden, {
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
      <div className="background min-vh-100 py-5">
        <div className="container text-center text-white">
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
    <div className="background min-vh-100 py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">

                {/* --- Encabezado y Descripción del Módulo --- */}
                <div className="border-bottom pb-3 mb-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-2">
                    <div>
                      <h2 className="fw-bold text-primary mb-1">
                        📋 Detalles de la Compra y Resumen
                      </h2>
                      <p className="text-muted mb-0 fs-6">
                        Revisa el listado de tus productos seleccionados y completa la información de envío para finalizar tu orden.
                      </p>
                    </div>
                    <span className="badge bg-primary fs-5 px-3 py-2 mt-2 mt-md-0 shadow-sm">
                      Total a pagar: ${formatearPrecio(total)}
                    </span>
                  </div>

                  {/* Cuestión explicativa para el usuario */}
                  <div className="alert alert-light border mt-3 mb-0 rounded-3">
                    <small className="text-secondary d-block">
                      💡 <strong>¿De qué se trata esta página?</strong> Aquí podrás verificar el detalle completo de tus joyas elegidas, ver la cantidad y el subtotal acumulado. Para confirmar la transacción, ingresa los datos personales del comprador y la dirección donde deseas recibir o retirar tu pedido.
                    </small>
                  </div>
                </div>

                {/* Tabla de Productos */}
                <h5 className="fw-bold mb-3">Artículos seleccionados en tu Carrito</h5>
                <TablaCompra filas={filas} />

                {/* Formulario de Checkout */}
                <form id="formCheckout" noValidate className={validado ? 'was-validated' : ''} onSubmit={pagar}>
                  <h5 className="fw-bold mt-4">Información del cliente</h5>
                  <p className="text-muted small mb-3">Completa tus datos personales para la emisión de la boleta</p>
                  
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
                    <label htmlFor="correo" className="form-label">Correo electrónico <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" id="correo" name="correo" maxLength="100"
                      placeholder="nombre@dominio.cl" value={form.correo} onChange={cambiar} required />
                    <div className="invalid-feedback">Ingresa un correo válido.</div>
                  </div>

                  <h5 className="fw-bold">Dirección de entrega de los productos</h5>
                  <p className="text-muted small mb-3">Ingresa la dirección detallada para el envío</p>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="calle" className="form-label">Calle y Número <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" id="calle" name="calle" maxLength="150"
                        value={form.calle} onChange={cambiar} required />
                      <div className="invalid-feedback">Ingresa la calle.</div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="departamento" className="form-label">Departamento / Casa (opcional)</label>
                      <input type="text" className="form-control" id="departamento" name="departamento" maxLength="30"
                        placeholder="Ej: Depto 603" value={form.departamento} onChange={cambiar} />
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
                      placeholder="Ej: Entre calles, depto con portón negro, no tiene timbre."
                      value={form.indicaciones} onChange={cambiar} />
                  </div>

                  <div className="mb-4">
                    <label className="form-label d-block fw-semibold">Opción de entrega</label>
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

                  <div className="text-end pt-3 border-top">
                    <button type="submit" className="btn btn-success btn-lg px-4 fw-bold" id="btnPagarAhora" disabled={procesando}>
                      {procesando ? 'Procesando pago...' : 'Pagar ahora $' + formatearPrecio(total)}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}