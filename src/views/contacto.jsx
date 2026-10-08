import { useState } from 'react'

const formularioVacio = { nombre: '', correo: '', comentario: '' }

export const correoValido = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)

export default function Contacto() {
  const [datos, setDatos] = useState(formularioVacio)
  const [errorCorreo, setErrorCorreo] = useState('')

  const handleChange = (e) => {
    const { id, value } = e.target
    setDatos((prev) => ({ ...prev, [id]: value }))
    if (id === 'correo') setErrorCorreo('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!correoValido(datos.correo)) {
      setErrorCorreo('Ingresa un correo válido, por ejemplo nombre@dominio.cl')
      return
    }

    fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: datos.nombre,
        correo: datos.correo,
        comentario: datos.comentario,
      }),
    })
      .then((respuesta) => respuesta.json())
      .then(() => {
        alert('¡Gracias! Tu mensaje fue enviado.')
        setDatos(formularioVacio)
      })
      .catch((error) => {
        console.log('Error al enviar el contacto:', error)
        alert('Hubo un problema al enviar tu mensaje. Intenta de nuevo.')
      })
  }

  return (
    <div className="background min-vh-100">
      <div className="container my-5">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3
                  style={{
                    textAlign: 'center',
                    fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
                  }}
                >
                  Contactanos
                </h3>

                <form id="formContact" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      placeholder="Ingresa tu nombre"
                      maxLength={100}
                      required
                      value={datos.nombre}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      id="correo"
                      placeholder="nombre@dominio.cl"
                      maxLength={100}
                      required
                      value={datos.correo}
                      onChange={handleChange}
                    />
                    <div className="form-text text-danger" id="error-correo">{errorCorreo}</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="comentario" className="form-label">Comentario</label>
                    <textarea
                      className="form-control"
                      id="comentario"
                      rows={5}
                      placeholder="Escribe tu comentario..."
                      maxLength={500}
                      required
                      value={datos.comentario}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 mt-2">
                    Enviar mensaje
                  </button>
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
