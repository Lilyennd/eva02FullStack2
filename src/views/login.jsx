import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/api'
import { guardarUsuario } from '../services/sesion'


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

a
  const redirigirSegunRol = (rol) => {
    if (rol === 2) {
      navigate('/admin')      
    } else if (rol === 3) {
      navigate('/inventario') 
    } else {
      navigate('/home')       
    }
  }

  
  useEffect(() => {
    const inicializarGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })

        const divBoton = document.getElementById('googleBtnDiv')
        if (divBoton) {

          const anchoDisponible = divBoton.parentElement.clientWidth

          const ancho = Math.min(320, Math.max(200, anchoDisponible))

  
          window.google.accounts.id.renderButton(divBoton, {
            theme: 'outline',
            size: 'large',
            width: ancho,
            text: 'signin_with',
          })
        }
      }
    }


    if (window.google?.accounts?.id) {
      inicializarGoogle()
    } else {
      const timer = setTimeout(inicializarGoogle, 1000)
      return () => clearTimeout(timer)
    }
  }, [])


  const handleGoogleResponse = async (response) => {
    try {
      const res = await apiFetch('/api/login/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorPassword(data.error || 'Error al iniciar sesión con Google')
        return
      }
      guardarUsuario(data.usuario, data.token)
      redirigirSegunRol(data.usuario.id_rol)
    } catch (err) {
      console.error('Error Google Auth:', err)
      setErrorPassword('No se pudo conectar con el servidor de autenticación.')
    }
  }


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
      const respuesta = await apiFetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correoLimpio, password }),
      })

      const data = await respuesta.json()

      if (!respuesta.ok) {
        setErrorPassword(data.error || 'No se pudo iniciar sesión')
        return
      }


      guardarUsuario(data.usuario, data.token)
      redirigirSegunRol(data.usuario.id_rol)
    } catch (error) {
      console.error('Error de red:', error)
      setErrorPassword('No se pudo conectar con el servidor.')
    }
  }

  return (
    <div className="background min-vh-100">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-4">
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

                <div className="text-center my-3">
                  <span className="text-muted small">o inicia sesión con</span>
                </div>

                <div className="d-flex justify-content-center mb-3 overflow-hidden">
                  <div id="googleBtnDiv"></div>
                </div>

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