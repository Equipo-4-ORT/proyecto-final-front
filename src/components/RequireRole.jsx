import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export default function RequireRole({ role, children }) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}