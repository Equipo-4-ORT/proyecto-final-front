import api from './api'

export const getUserSettings = () =>
  api.get('/api/users/me/settings').then((r) => r.data)

export const updateUserSettings = (payload) =>
  api.put('/api/users/me/settings', payload).then((r) => r.data)
