import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// Solo estos dominios pueden entrar (antes venía de utils/validaciones)
function correoPermitido(correo) {
  const c = correo.trim().toLowerCase()
  return c.endsWith('@profesor.duoc.cl') || c.endsWith('@duocuc.cl') || c.endsWith('@gmail.com')
}

export default function Login() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorPassword, setErrorPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorCorreo('')
    setErrorPassword('')

    const correoLimpio = correo.trim()

    if (!correoPermitido(correoLimpio)) {
      setErrorCorreo('Correo no permitido. Usa @gmail.com, @duocuc.cl o @profesor.duoc.cl.')
      return
    }

    if (password.length < 4 || password.length > 10) {
      setErrorPassword('La contraseña debe tener entre 4 y 10 caracteres.')
      return
    }

    try {
      const respuesta = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correoLimpio, password }),
      })

      const data = await respuesta.json()

      if (!respuesta.ok) {
        setErrorPassword(data.error || 'No se pudo iniciar sesión')
        return
      }

      // Misma clave que usaba navbar.js
      localStorage.setItem('usuarioActual', JSON.stringify(data.usuario))
      navigate('/home')
    } catch (error) {
      console.error('Error de red:', error)
      setErrorPassword('No se pudo conectar con el servidor.')
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-5">
            <div className="card shadow border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <h3 className="card-title text-center mb-4 fw-bold">Iniciar Sesión</h3>

                <form id="formLogin" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="correo" className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control"
                      id="correo"
                      placeholder="nombre@dominio.cl"
                      maxLength={100}
                      required
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                    />
                    <div className="form-text text-danger" id="error-correo">{errorCorreo}</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="form-text text-danger" id="error-password">{errorPassword}</div>
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 mt-2">Entrar</button>
                </form>

                <p className="text-center mt-3 mb-0">
                  ¿No tienes cuenta? <Link to="/registroUsuario">Regístrate</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
    </div>
  )
}
