import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function Callback() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    // lgtm[js/user-controlled-bypass] - token proviene del redirect de nuestro backend tras OAuth,
    // la validación real de firma ocurre server-side en cada llamada a la API.
    // Deuda técnica: migrar a cookie HTTP-only para no exponer el token en la URL.
    if (token) {
      login(token)
      window.history.replaceState({}, document.title, '/callback')
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }, [location.search, navigate, login])

  return <h1>Procesando login...</h1>
}

export default Callback
