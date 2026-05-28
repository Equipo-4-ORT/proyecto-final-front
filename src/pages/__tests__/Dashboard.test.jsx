import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Dashboard from '../Dashboard'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock reportsApi para evitar requests reales
vi.mock('../../services/api', () => ({
  reportsApi: {
    generateReport: vi.fn().mockResolvedValue({}),
  },
}))

import { reportsApi } from '../../services/api'

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

  it("calls reportsApi.generateReport when clicking 'Descargar Excel'", async () => {
    renderDashboard()

    const excelBtn = screen.getByRole('button', { name: /descargar excel/i })
    fireEvent.click(excelBtn)

    await waitFor(() => {
      expect(reportsApi.generateReport).toHaveBeenCalled()
    })
  })

  it('shows success toast when generateReport resolves', async () => {
    reportsApi.generateReport.mockResolvedValueOnce({})
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
