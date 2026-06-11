import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useReport } from '../useReport'
import { getReportByDate } from '../../services/reportsService'

vi.mock('../../services/reportsService', () => ({
  getReportByDate: vi.fn(),
}))

describe('useReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('arranca en estado de carga, sin data ni error', () => {
    getReportByDate.mockReturnValue(new Promise(() => {})) // queda pendiente
    const { result } = renderHook(() => useReport('2026-05-30'))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('expone los datos del reporte cuando la API responde', async () => {
    const report = { date: '2026-05-30', activities: [] }
    getReportByDate.mockResolvedValue(report)

    const { result } = renderHook(() => useReport('2026-05-30'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(getReportByDate).toHaveBeenCalledWith('2026-05-30')
    expect(result.current.data).toEqual(report)
    expect(result.current.error).toBeNull()
  })

  it('expone el error cuando la API falla', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = new Error('API Error')
    getReportByDate.mockRejectedValue(mockError)

    const { result } = renderHook(() => useReport('2026-05-30'))

    await waitFor(() => expect(result.current.error).toBe(mockError))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeNull()
  })
})
