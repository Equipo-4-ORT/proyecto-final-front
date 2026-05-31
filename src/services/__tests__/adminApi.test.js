import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import api from '../api'
import { adminApi } from '../adminApi'

describe('adminApi', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getUsers', () => {
    it('calls GET /api/admin/users and returns the data', async () => {
      const users = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ]
      api.get.mockResolvedValue({ data: users })

      const result = await adminApi.getUsers()

      expect(api.get).toHaveBeenCalledWith('/api/admin/users')
      expect(result).toEqual(users)
    })
  })

  describe('createUser', () => {
    it('calls POST /api/admin/users with the payload and returns the created user', async () => {
      const payload = { email: 'newuser@example.com', name: 'New User' }
      const created = { id: 'abc-123', ...payload }
      api.post.mockResolvedValue({ data: created })

      const result = await adminApi.createUser(payload)

      expect(api.post).toHaveBeenCalledWith('/api/admin/users', payload)
      expect(result).toEqual(created)
    })
  })

  describe('toggleStatus', () => {
    it('calls PATCH /api/admin/users/:id/status and returns the updated user', async () => {
      const userId = 'user-123'
      const updated = { id: userId, status: 'inactive' }
      api.patch.mockResolvedValue({ data: updated })

      const result = await adminApi.toggleStatus(userId)

      expect(api.patch).toHaveBeenCalledWith(
        `/api/admin/users/${userId}/status`,
      )
      expect(result).toEqual(updated)
    })
  })
})
