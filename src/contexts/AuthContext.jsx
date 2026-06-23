import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { AuthContext } from './auth-context'

// El front ya NO decodifica el JWT ni toca localStorage: la identidad la da el
// backend vía GET /auth/me (que valida la cookie y revalida el usuario en DB).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hidratar al montar: si había sesión, el browser ya tiene la cookie.
    let cancelled = false
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Re-hidrata el contexto (post-login en Callback, post-conexión de Jira, etc.).
  // Re-lanza el error para que el caller pueda distinguir éxito de fallo.
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      setUser(null)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* aun si falla el backend, limpiamos el estado local */
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}