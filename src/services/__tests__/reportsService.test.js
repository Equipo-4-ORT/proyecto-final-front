import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mockeamos api
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(), 
  },
}))

import api from '../api'
import { getReportByDate, generateReport } from '../reportsService'

describe('reportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna los datos del reporte cuando la API responde correctamente', async () => {
    const reportData = { date: '2026-05-30', activities: [] }
    api.get.mockResolvedValue({ data: reportData })

    const result = await getReportByDate('2026-05-30')

    expect(api.get).toHaveBeenCalledWith('/api/reports', {
      params: { from: '2026-05-30', to: '2026-05-30' },
    })
    expect(result).toEqual(reportData)
  })

  it('usa el mismo valor para from y to si solo se pasa una fecha', async () => {
    api.get.mockResolvedValue({ data: {} })
    await getReportByDate('2026-05-30')

    expect(api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: { from: '2026-05-30', to: '2026-05-30' },
      })
    )
  })

  it('propaga el error cuando la API falla', async () => {
    api.get.mockRejectedValue(new Error('Network error'))

    await expect(getReportByDate('2026-05-30')).rejects.toThrow('Network error')
  })

  // TEST PARA LA FUNCIÓN QUE FALTABA
  it('generateReport llama al endpoint correcto con timeout', async () => {
    const mockData = { some: 'data' }
    // Aquí usamos el api.post que mockeamos arriba
    api.post.mockResolvedValue({ data: { success: true } })
    
    const result = await generateReport(mockData)
    
    expect(api.post).toHaveBeenCalledWith('/api/reports/generate', mockData, {
      timeout: 120000,
    })
    expect(result).toEqual({ success: true })
  })
})