import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const isValidJWT = (token) =>
  typeof token === 'string' && token.split('.').length === 3

function Callback() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Se obtiene el token desde la query (?token=...)
    const params = new URLSearchParams(location.search)
    const token = params.get('token')

    // TODO: validar token contra backend cuando esté disponible

    if (token && isValidJWT(token)) {
      // Se guarda el JWT en localStorage
      localStorage.setItem('token', token) // Esto no es seguro para producción.
      // En una implementación real el token debería manejarse con cookies httpOnly desde el backend.

      // Limpia la URL para evitar que el token quede visible
      window.history.replaceState({}, document.title, '/callback')

      // Redirección a la app principal
      navigate('/dashboard', { replace: true })
    } else {
      // Si no hay token, se vuelve al login
      navigate('/login')
    }
  }, [location.search, navigate])

  return <h1>Procesando login...</h1>
  // TODO: mostrar mensaje de error al usuario si el login falla
}

export default Callback
