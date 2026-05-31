import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '../api'
import { getReportByDate } from '../reportsService'

describe('reportsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna los datos del reporte cuando la API responde correctamente', async () => {
    const reportData = { date: '2026-05-30', activities: [] }
    api.get.mockResolvedValue({ data: reportData })

    const result = await getReportByDate('2026-05-30')

    expect(api.get).toHaveBeenCalledWith('/api/reports/2026-05-30')
    expect(result).toEqual(reportData)
  })

  it('propaga el error cuando la API falla', async () => {
    api.get.mockRejectedValue(new Error('Network error'))

    await expect(getReportByDate('2026-05-30')).rejects.toThrow('Network error')
  })
})
