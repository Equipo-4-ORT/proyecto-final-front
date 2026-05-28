import axios from 'axios'

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined')
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api

export const adminApi = {
  getUsers: () => api.get('/api/admin/users').then((r) => r.data),
  createUser: (data) => api.post('/api/admin/users', data).then((r) => r.data),
  toggleStatus: (id) =>
    api.patch(`/api/admin/users/${id}/status`).then((r) => r.data),
}

export const reportsApi = {
  // NOTE: Este endpoint aún no está implementado en el backend
  // Funcionará una vez que se implemente POST /api/reports/generate en el servidor
  generateReport: (data) =>
    api
      .post('/api/reports/generate', data, {
        timeout: 90000, // 90 segundos máximo
      })
      .then((r) => r.data),
}
