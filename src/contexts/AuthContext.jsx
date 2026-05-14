import { useMemo, useState } from 'react'

import { AuthContext } from './auth-context'

function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]

    const decoded = JSON.parse(atob(payload))

    return decoded
  } catch {
    return null
  }
}

const storedToken = localStorage.getItem('token')

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storedToken || null)

  const [user, setUser] = useState(() => {
    if (!storedToken) {
      return null
    }

    return decodeJWT(storedToken)
  })

  const [loading] = useState(false)

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