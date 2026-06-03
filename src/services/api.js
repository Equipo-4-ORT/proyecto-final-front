import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined')
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // manda/recibe las cookies HttpOnly de sesión (cross-origin)
})

// El browser adjunta access_token automáticamente: ya no hay interceptor de request
// que lea localStorage ni header Authorization.

// Refresh transparente: ante un 401, intenta POST /auth/refresh una sola vez y
// reintenta la request original. Coalesce: si ya hay un refresh en vuelo, todas
// las requests en paralelo esperan el mismo (no se dispara una tormenta de refresh).
let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') && // evita loop si el propio refresh da 401
      !original.url?.includes('/auth/me') // /me da 401 sin sesión: no tiene sentido reintentar
    ) {
      original._retry = true

      try {
        refreshPromise ||= api.post('/auth/refresh').finally(() => {
          refreshPromise = null
        })
        await refreshPromise
        return api(original) // retry con la cookie nueva
      } catch (refreshErr) {
        // Refresh falló → no hay sesión recuperable. Mandamos a login.
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  },
)

export default api
