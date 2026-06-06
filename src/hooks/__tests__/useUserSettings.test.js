import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('../../services/userSettingsApi', () => ({
  getUserSettings: vi.fn(),
}))

import { getUserSettings } from '../../services/userSettingsApi'
import { useUserSettings } from '../useUserSettings'
import {
  DEFAULT_ACTIVITY_HOURS,
  DEFAULT_WORKDAY_HOURS,
} from '../../pages/Dashboard/utils/dashboardCalculations'

describe('useUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mantiene los valores por defecto cuando el backend falla', async () => {
    getUserSettings.mockRejectedValue(new Error('sin backend'))

    const { result } = renderHook(() => useUserSettings())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.workdayHours).toBe(DEFAULT_WORKDAY_HOURS)
    expect(result.current.defaultActivityHours).toBe(DEFAULT_ACTIVITY_HOURS)
  })

  it('deriva la jornada y la duración a partir de la configuración del backend', async () => {
    getUserSettings.mockResolvedValue({
      workStartTime: '09:00',
      workEndTime: '18:00',
      defaultDuration: 2,
    })

    const { result } = renderHook(() => useUserSettings())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.workdayHours).toBe(9)
    expect(result.current.defaultActivityHours).toBe(2)
  })
})
