import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

// Destinos que el backend puede indicar vía ?redirect=. Allowlist para evitar
// open-redirect: cualquier valor fuera de acá cae al default.
const ALLOWED_REDIRECTS = ['/admin', '/dashboard']
const DEFAULT_REDIRECT = '/dashboard'

// Ya no recibe ?token= en la URL: las cookies se setearon en el redirect del
// backend. Solo confirma que la sesión quedó y navega al destino que el backend
// eligió según el rol (?redirect=), validándolo contra la allowlist.
function Callback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const requested = searchParams.get('redirect')
    const destination = ALLOWED_REDIRECTS.includes(requested)
      ? requested
      : DEFAULT_REDIRECT

    refreshUser()
      .then(() => navigate(destination))
      .catch(() => navigate('/login?error=auth_failed'))
  }, [navigate, refreshUser, searchParams])

  return <h1>Procesando login...</h1>
}

export default Callback
