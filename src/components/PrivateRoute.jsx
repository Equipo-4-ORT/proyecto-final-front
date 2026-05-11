import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <h1>Cargando...</h1>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute