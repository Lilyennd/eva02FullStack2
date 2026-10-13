import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ordenesApi } from '../services/api'
import { TablaOrdenes } from './adminOrdenes'

export default function HistorialCompras() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const [ordenes, setOrdenes] = useState([])
  const [error, setError] = useState(id ? '' : 'No se indicó el usuario.')

  useEffect(() => {
    if (!id) return
    let vigente = true
    ordenesApi
      .listar(id)
      .then((lista) => vigente && setOrdenes(lista))
      .catch((err) => vigente && setError(err.message))
    return () => {
      vigente = false
    }
  }, [id])

  return (
    <div className="background min-vh-100">
      <div className="container py-5">
        <h1 className="text-center mb-4 herotitulo" style={{ color: 'white' }}>Historial de compras</h1>
        <div className="card shadow border-0 rounded-4 p-4">
          {error ? <p className="text-danger mb-0">{error}</p> : <TablaOrdenes ordenes={ordenes} />}
        </div>
      </div>
    </div>
  )
}
