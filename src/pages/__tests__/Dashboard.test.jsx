import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../hooks/useJiraConnection', () => ({
  useJiraConnection: () => ({
    status: {
      connected: false,
      siteUrl: null,
      lastSyncAt: null,
      reconnectRequired: false,
    },
    loading: false,
    actionInFlight: null,
    error: null,
    lastSyncResult: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    syncToday: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('../../services/activitiesApi', () => ({
  listActivities: vi.fn().mockResolvedValue([]),
  createActivity: vi.fn(),
  updateActivity: vi.fn(),
  deleteActivity: vi.fn(),
}))

vi.mock('../../services/reportsService', () => ({
  getReportByDate: vi.fn().mockResolvedValue(null),
  generateReport: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../services/userSettingsApi', () => ({
  getUserSettings: vi.fn().mockResolvedValue(null),
  updateUserSettings: vi.fn(),
}))

import Dashboard from '../Dashboard'
import { AuthProvider } from '../../contexts/AuthContext'
import { generateReport } from '../../services/reportsService'

const renderDashboard = () =>
  render(
    <AuthProvider>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AuthProvider>,
  )

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Dashboard heading in the header', () => {
    renderDashboard()

    expect(
      screen.getByRole('heading', {
        name: /^dashboard$/i,
        level: 2,
      }),
    ).toBeInTheDocument()
  })

  it("calls generateReport when clicking 'Descargar Excel'", async () => {
    renderDashboard()

    const excelBtn = screen.getByRole('button', { name: /descargar excel/i })
    fireEvent.click(excelBtn)

    await waitFor(() => {
      expect(generateReport).toHaveBeenCalled()
    })
  })

  it('shows success toast when generateReport resolves', async () => {
    generateReport.mockResolvedValueOnce({})
    renderDashboard()

    const excelBtn = screen.getByRole('button', { name: /descargar excel/i })
    fireEvent.click(excelBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/informe generado exitosamente/i),
      ).toBeInTheDocument()
    })
  })
})