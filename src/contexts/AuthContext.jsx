import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token')
  })

  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)

      setUser({
        name: 'Martín',
        email: 'martin@test.com',
      })
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  function login(newToken) {
    setToken(newToken)
  }

  function logout() {
    setToken(null)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}