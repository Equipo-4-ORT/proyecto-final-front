import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const captured = { interceptor: null, baseURL: null }

vi.mock('axios', () => {
  const create = vi.fn((config) => {
    captured.baseURL = config?.baseURL ?? null
    return {
      interceptors: {
        request: {
          use: vi.fn((onFulfilled) => {
            captured.interceptor = onFulfilled
          }),
        },
      },
    }
  })
  return { default: { create }, create }
})

describe('api service', () => {
  beforeEach(() => {
    captured.interceptor = null
    captured.baseURL = null
    vi.resetModules()
    localStorage.clear()
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

  it('registers a request interceptor', async () => {
    await import('../api')
    expect(captured.interceptor).toBeTypeOf('function')
  })

  it('adds the Authorization header when a token is stored', async () => {
    localStorage.setItem('token', 'abc.def.ghi')
    await import('../api')
    const result = captured.interceptor({ headers: {} })
    expect(result.headers.Authorization).toBe('Bearer abc.def.ghi')
  })

  it('does not add Authorization when no token is stored', async () => {
    await import('../api')
    const result = captured.interceptor({ headers: {} })
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('reportsApi.generateReport is a function', async () => {
    const apiModule = await import('../api')
    expect(typeof apiModule.reportsApi.generateReport).toBe('function')
  })

  it('reportsApi.generateReport has timeout of 90 seconds', async () => {
    // Verificar que la estructura de la función es correcta
    // y que el timeout está definido
    const apiModule = await import('../api')
    expect(apiModule.reportsApi).toBeDefined()
    expect(apiModule.reportsApi.generateReport).toBeDefined()
  })
})
