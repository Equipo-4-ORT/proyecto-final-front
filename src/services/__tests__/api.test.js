import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const captured = {
  baseURL: null,
  withCredentials: null,
  onFulfilled: null,
  onRejected: null,
  instance: null,
}

vi.mock('axios', () => {
  const create = vi.fn((config) => {
    captured.baseURL = config?.baseURL ?? null
    captured.withCredentials = config?.withCredentials ?? null

    // Instancia callable: api(originalConfig) simula el retry.
    const instance = vi.fn(() => Promise.resolve({ data: 'retried' }))
    instance.post = vi.fn(() => Promise.resolve({ data: 'refreshed' }))
    instance.interceptors = {
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          captured.onFulfilled = onFulfilled
          captured.onRejected = onRejected
        }),
      },
    }
    captured.instance = instance
    return instance
  })
  return { default: { create }, create }
})

describe('api service', () => {
  beforeEach(() => {
    captured.baseURL = null
    captured.withCredentials = null
    captured.onFulfilled = null
    captured.onRejected = null
    captured.instance = null
    vi.resetModules()
    vi.stubEnv('VITE_API_URL', 'http://test.local')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws when VITE_API_URL is not defined', async () => {
    vi.stubEnv('VITE_API_URL', '')
    await expect(import('../api')).rejects.toThrow(/VITE_API_URL/)
  })

  it('creates the axios client with the baseURL from env', async () => {
    await import('../api')
    expect(captured.baseURL).toBe('http://test.local')
  })

  it('creates the client with withCredentials enabled (manda cookies)', async () => {
    await import('../api')
    expect(captured.withCredentials).toBe(true)
  })

  it('registers a response interceptor (sin interceptor de request/localStorage)', async () => {
    await import('../api')
    expect(captured.onFulfilled).toBeTypeOf('function')
    expect(captured.onRejected).toBeTypeOf('function')
  })

  it('on 401 refreshes once and retries the original request', async () => {
    await import('../api')
    const original = { url: '/api/activities', headers: {} }
    const error = { config: original, response: { status: 401 } }

    const result = await captured.onRejected(error)

    expect(captured.instance.post).toHaveBeenCalledWith('/auth/refresh')
    expect(captured.instance).toHaveBeenCalledWith(original)
    expect(result).toEqual({ data: 'retried' })
  })

  it('does not retry twice (evita loop) si ya se reintentó', async () => {
    await import('../api')
    const error = { config: { url: '/api/x', headers: {}, _retry: true }, response: { status: 401 } }
    await expect(captured.onRejected(error)).rejects.toBe(error)
    expect(captured.instance.post).not.toHaveBeenCalled()
  })

  it('does not refresh on 401 from /auth/me', async () => {
    await import('../api')
    const error = { config: { url: '/auth/me', headers: {} }, response: { status: 401 } }
    await expect(captured.onRejected(error)).rejects.toBe(error)
    expect(captured.instance.post).not.toHaveBeenCalled()
  })

  it('rejects non-401 errors without refreshing', async () => {
    await import('../api')
    const error = { config: { url: '/api/x', headers: {} }, response: { status: 500 } }
    await expect(captured.onRejected(error)).rejects.toBe(error)
    expect(captured.instance.post).not.toHaveBeenCalled()
  })
})
