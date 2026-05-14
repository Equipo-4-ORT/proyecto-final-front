import { useMemo, useState } from 'react'

import { AuthContext } from './auth-context'

const initialToken = localStorage.getItem('token')

const initialUser = initialToken
  ? {
      name: 'Martín',
      email: 'martin@test.com',
    }
  : null

export function AuthProvider({ children }) {
  const [token, setToken] = useState(initialToken)

  const [user, setUser] = useState(initialUser)

  function login(newToken) {
    localStorage.setItem('token', newToken)

    setToken(newToken)

    setUser({
      name: 'Martín',
      email: 'martin@test.com',
    })
  }

  function logout() {
    localStorage.removeItem('token')

    setToken(null)
    setUser(null)
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