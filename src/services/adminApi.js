import api from './api'

export const adminApi = {
  getUsers: () => api.get('/api/admin/users').then((r) => r.data),
  createUser: (data) => api.post('/api/admin/users', data).then((r) => r.data),
  toggleStatus: (id) => api.patch(`/api/admin/users/${id}/status`).then((r) => r.data),
}
