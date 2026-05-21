import { useState, useCallback, useMemo } from 'react'
import { AuthContext } from './auth-context'

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

const isTokenValid = (token) => {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3)
    return false
  const payload = decodeJWT(token)
  return payload && payload.exp * 1000 > Date.now()
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token')
    if (stored && !isTokenValid(stored)) {
      localStorage.removeItem('token')
      return null
    }
    return stored
  })

  const user = useMemo(() => {
    if (!isTokenValid(token)) return null
    const payload = decodeJWT(token)
    return { id: payload.sub, email: payload.email, role: payload.role }
  }, [token])

  const login = useCallback((newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}
