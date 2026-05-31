import { describe, it, expect, vi, beforeEach } from 'vitest'

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

  it('getUsers llama a GET /api/admin/users y retorna data', async () => {
    const usuarios = [{ id: 1, fullName: 'Ana', email: 'ana@test.com' }]
    api.get.mockResolvedValue({ data: usuarios })

    const result = await adminApi.getUsers()

    expect(api.get).toHaveBeenCalledWith('/api/admin/users')
    expect(result).toEqual(usuarios)
  })

  it('createUser llama a POST /api/admin/users y retorna el usuario creado', async () => {
    const payload = { fullName: 'Bruno', email: 'bruno@test.com' }
    const created = { id: 2, ...payload, status: 'ACTIVE', role: 'EMPLOYEE' }
    api.post.mockResolvedValue({ data: created })

    const result = await adminApi.createUser(payload)

    expect(api.post).toHaveBeenCalledWith('/api/admin/users', payload)
    expect(result).toEqual(created)
  })

  it('toggleStatus llama a PATCH /api/admin/users/:id/status y retorna el usuario actualizado', async () => {
    const updated = { id: 3, status: 'INACTIVE' }
    api.patch.mockResolvedValue({ data: updated })

    const result = await adminApi.toggleStatus(3)

    expect(api.patch).toHaveBeenCalledWith('/api/admin/users/3/status')
    expect(result).toEqual(updated)
  })
})
