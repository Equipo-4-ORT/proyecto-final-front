import { createContext, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext()

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]

    const decoded = JSON.parse(atob(payload))

    return decoded
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
 useEffect(() => {
  const storedToken = localStorage.getItem('token')

  if (storedToken) {
    const decodedUser = decodeJWT(storedToken)

    setToken(storedToken)
    setUser(decodedUser)
  }

  setLoading(false)
}, [])

  const login = (newToken) => {
    localStorage.setItem('token', newToken)

    const decodedUser = decodeJWT(newToken)

    setToken(newToken)
    setUser(decodedUser)
  }

  const logout = () => {
    localStorage.removeItem('token')

    setToken(null)
    setUser(null)

    // Más adelante podríamos pegarle al backend:
    // await api.post('/auth/logout')
  }

  const value = useMemo(
  () => ({
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  }),
  [token, user, loading],
)
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}