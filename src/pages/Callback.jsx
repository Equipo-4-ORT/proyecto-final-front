import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

const isValidJWT = (token) =>
  typeof token === 'string' &&
  token.split('.').length === 3

function Callback() {
  const navigate = useNavigate()
  const location = useLocation()

  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(location.search)

    const token = params.get('token')

    if (token && isValidJWT(token)) {
      login(token)

      window.history.replaceState({}, document.title, '/callback')

     navigate('/dashboard')
    } else {
      localStorage.removeItem('token')
      navigate('/login')
    }
  }, [location.search, navigate, login])

  return <h1>Procesando login...</h1>
}

export default Callback
