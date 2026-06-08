import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useActivities } from '../useActivities'
import { listActivities } from '../../services/activitiesApi'

vi.mock('../../services/activitiesApi', () => ({
  listActivities: vi.fn(),
}))

describe('useActivities', () => {
  it('maneja el error de la API correctamente', async () => {
    const mockError = new Error('API Error')
    listActivities.mockRejectedValue(mockError)

    const { result } = renderHook(() => useActivities('2026-05-30'))

    // Esperamos a que el useEffect termine y setee el error
    await waitFor(() => {
      expect(result.current.error).toBe(mockError)
      expect(result.current.isLoading).toBe(false)
    })
  })
})
