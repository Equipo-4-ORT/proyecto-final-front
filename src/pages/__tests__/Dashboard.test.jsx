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
    connect: vi.fn(),
    disconnect: vi.fn(),
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

// AuthProvider ahora hidrata con api.get('/auth/me') al montar: lo mockeamos para
// no pegar a la red. Rechaza → sesión nula (mismo escenario que el test original).
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('no session')),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
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

  it('renders the Dashboard heading in the header', async () => {
    renderDashboard()

    expect(
      await screen.findByRole('heading', {
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

  it('shows success toast with a link to the Sheet when generateReport returns a url', async () => {
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/abc123/edit'
    generateReport.mockResolvedValueOnce({ xlsxUrl: sheetUrl })
    renderDashboard()

    const excelBtn = screen.getByRole('button', { name: /descargar excel/i })
    fireEvent.click(excelBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/informe generado exitosamente/i),
      ).toBeInTheDocument()
    })

    const link = screen.getByRole('link', { name: /abrir google sheet/i })
    expect(link).toHaveAttribute('href', sheetUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('warns when the report is generated but no Sheet url is returned', async () => {
    generateReport.mockResolvedValueOnce({ xlsxUrl: null })
    renderDashboard()

    const excelBtn = screen.getByRole('button', { name: /descargar excel/i })
    fireEvent.click(excelBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/no pudimos crear el google sheet/i),
      ).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('link', { name: /abrir google sheet/i }),
    ).not.toBeInTheDocument()
  })
})