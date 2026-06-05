import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

// Ya no recibe ?token= en la URL: las cookies se setearon en el redirect del
// backend. Solo confirma que la sesión quedó y navega.
function Callback() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    refreshUser()
      .then(() => navigate('/dashboard'))
      .catch(() => navigate('/login?error=auth_failed'))
  }, [navigate, refreshUser])

  return <h1>Procesando login...</h1>
}

export default Callback
