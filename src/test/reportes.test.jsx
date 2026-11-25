import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import Reportes from '../views/reportes'
import { API_URL, apiFetch, ordenesApi } from '../services/api'
import { renderConRuta } from './utils'

const RUTA_LOGIN = '/api/v1/login'
const CREDENCIALES = { correo: 'admin@profesor.duoc.cl', password: 'admin123' }

let descargas = []
let tokenAdmin = ''

const leerBlob = (blob) =>
  new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(String(lector.result))
    lector.onerror = reject
    lector.readAsText(blob)
  })

const lineasDelCsv = (texto) =>
  texto.replace(/^\uFEFF/, '').split('\r\n').filter((l) => l !== '')

describe('Reportes con backend real (descarga de Excel)', () => {
  beforeAll(async () => {
    let respuestaLogin
    try {
      respuestaLogin = await fetch(API_URL + RUTA_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENCIALES),
      })
    } catch (e) {
      throw new Error('No se pudo conectar al backend. ¿Está corriendo en el puerto 8080?')
    }
    if (!respuestaLogin.ok) {
      const detalle = await respuestaLogin.text()
      throw new Error(
        'El login falló (' + respuestaLogin.status + '): ' + detalle +
        ' | Revisa RUTA_LOGIN y CREDENCIALES.'
      )
    }
    const datos = await respuestaLogin.json()
    if (!datos.token) {
      throw new Error('El login funcionó pero no vino el token. Respuesta: ' + JSON.stringify(datos))
    }
    tokenAdmin = datos.token
  }, 20000)

  beforeEach(() => {
    localStorage.setItem('token', tokenAdmin)

    descargas = []

    URL.createObjectURL = vi.fn((blob) => {
      descargas.push({ blob })
      return 'blob:falso'
    })
    URL.revokeObjectURL = vi.fn()

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      descargas[descargas.length - 1].nombre = this.download
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('el backend entrega productos y órdenes', async () => {
    const resp = await apiFetch('/api/productos')
    expect(resp.ok).toBe(true)
    const productos = await resp.json()
    expect(Array.isArray(productos)).toBe(true)

    const ordenes = await ordenesApi.listar(null, { desde: '', hasta: '' })
    expect(Array.isArray(ordenes)).toBe(true)
  }, 15000)

  it('descarga el Excel de inventario con los datos del backend', async () => {
    const productos = await (await apiFetch('/api/productos')).json()

    renderConRuta(<Reportes />, '/reportes', '/reportes')

    const boton = await screen.findByText('Excel: inventario')
    await waitFor(() => expect(boton).not.toBeDisabled(), { timeout: 10000 })
    fireEvent.click(boton)

    expect(descargas).toHaveLength(1)
    expect(descargas[0].nombre).toBe('reporte-inventario.csv')

    const texto = await leerBlob(descargas[0].blob)
    const lineas = lineasDelCsv(texto)

    expect(lineas[0]).toBe('"Código";"Producto";"Stock";"Precio";"Valor en stock"')
    expect(lineas).toHaveLength(productos.length + 1)
    expect(texto).toContain(productos[0].codigo_producto)
  }, 20000)

  it('descarga el Excel de ventas con las órdenes del backend', async () => {
    const ordenes = await ordenesApi.listar(null, { desde: '', hasta: '' })

    renderConRuta(<Reportes />, '/reportes', '/reportes')

    const boton = await screen.findByText('Excel: ventas')
    await waitFor(() => expect(boton).not.toBeDisabled(), { timeout: 10000 })
    fireEvent.click(boton)

    expect(descargas[0].nombre).toBe('reporte-ventas.csv')

    const lineas = lineasDelCsv(await leerBlob(descargas[0].blob))
    expect(lineas[0]).toBe(
      '"N° orden";"Fecha";"Cliente";"Correo";"Estado";"Descuento";"Envío";"Total"'
    )
    expect(lineas).toHaveLength(ordenes.length + 1)
  }, 20000)

  it('descarga el Excel de órdenes por estado', async () => {
    const ordenes = await ordenesApi.listar(null, { desde: '', hasta: '' })
    const estadosDistintos = new Set(ordenes.map((o) => o.estado)).size

    renderConRuta(<Reportes />, '/reportes', '/reportes')

    const boton = await screen.findByText('Excel: órdenes por estado')
    await waitFor(() => expect(boton).not.toBeDisabled(), { timeout: 10000 })
    fireEvent.click(boton)

    expect(descargas[0].nombre).toBe('reporte-ordenes-por-estado.csv')

    const lineas = lineasDelCsv(await leerBlob(descargas[0].blob))
    expect(lineas[0]).toBe('"Estado";"Cantidad";"Total"')
    expect(lineas).toHaveLength(estadosDistintos + 1)
  }, 20000)
})