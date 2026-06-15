import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { AuthProvider } from '../../contexts/AuthContext'
import { ActivityContext } from '../../contexts/ActivityContextDef'; 
import { generateReport } from '../../services/reportsService'
import { updateActivity } from '../../services/activitiesApi'
import { getTodayDate } from '../../utils/dateHelpers'

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

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('no session')),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

const renderDashboard = (contextOverrides = {}) =>
  render(
    <AuthProvider>
      <ActivityContext.Provider
        value={{
          activities: [],
          sourceCounts: {},
          isLoading: false,
          error: null,
          refreshActivities: vi.fn(),
          date: '2026-06-14',
          setDate: vi.fn(),
          ...contextOverrides,
        }}
      >
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ActivityContext.Provider>
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

  it('actualiza una actividad existente leyendo el original del contexto', async () => {
    // Regresión: el original se buscaba en un ref que quedaba stale y siempre
    // devolvía undefined, por lo que toda edición fallaba. Debe encontrarse en
    // las actividades del contexto y llamar a updateActivity + refreshActivities.
    const refreshActivities = vi.fn().mockResolvedValue(undefined)
    updateActivity.mockResolvedValueOnce({})

    const activity = {
      id: 'act-1',
      source: 'calendar',
      title: 'Reunión',
      description: 'desc',
      start: '10:00',
      end: '11:00',
      status: 'pending',
      notes: '',
      startTime: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    }

    renderDashboard({
      activities: [activity],
      date: getTodayDate(),
      refreshActivities,
    })

    fireEvent.click(screen.getAllByLabelText(/editar actividad/i)[0])

    const titleInput = screen.getAllByPlaceholderText('Título')[0]
    fireEvent.change(titleInput, { target: { value: 'Reunión editada' } })

    fireEvent.click(screen.getAllByLabelText(/guardar edición/i)[0])

    await waitFor(() => {
      expect(updateActivity).toHaveBeenCalledTimes(1)
    })
    expect(updateActivity).toHaveBeenCalledWith('act-1', expect.any(Object))
    expect(refreshActivities).toHaveBeenCalled()
    expect(
      screen.queryByText(/no pudimos actualizar la actividad/i),
    ).not.toBeInTheDocument()
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