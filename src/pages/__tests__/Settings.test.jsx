import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('../../components/layout/AppLayout', () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock('../../services/userSettingsApi', () => ({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn(),
}))

import Settings from '../Settings'
import {
  getUserSettings,
  updateUserSettings,
} from '../../services/userSettingsApi'

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('carga la configuración actual desde el backend', async () => {
    getUserSettings.mockResolvedValue({
      workStartTime: '09:00',
      workEndTime: '18:00',
      avoidOverlaps: true,
      defaultDuration: 2,
    })

    render(<Settings />)

    await waitFor(() =>
      expect(screen.getByDisplayValue('09:00')).toBeInTheDocument(),
    )
    expect(screen.getByDisplayValue('18:00')).toBeInTheDocument()
  })

  it('guarda los cambios y muestra un toast de éxito', async () => {
    getUserSettings.mockResolvedValue({})
    updateUserSettings.mockResolvedValue({})

    render(<Settings />)

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /guardar cambios/i }),
      ).toBeInTheDocument(),
    )

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    await waitFor(() => {
      expect(updateUserSettings).toHaveBeenCalled()
      expect(
        screen.getByText(/configuración actualizada con éxito/i),
      ).toBeInTheDocument()
    })
  })
})
