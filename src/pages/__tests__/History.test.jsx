import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryPage from '../History'

const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  }
})

const mockLogout = vi.fn()
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@usuario.com', name: 'Usuario Test' },
    logout: mockLogout,
  }),
}))

vi.mock('../../components/layout/AppLayout', () => ({
  default: ({ children, onLogout }) => (
    <div>
      <button onClick={onLogout}>Mock Logout</button>
      {children}
    </div>
  ),
}))

vi.mock('../Dashboard/components/StatusBadge', () => ({
  default: ({ status }) => <span>{status}</span>,
}))

const TEST_RECORDS = [
  {
    id: 1,
    date: '2026-05-01',
    totalHours: '7 h 30 min',
    status: 'Aprobado',
    iaReport: 'Reporte del día 1',
  },
  {
    id: 2,
    date: '2026-05-02',
    totalHours: '8 h 0 min',
    status: 'Pendiente',
    iaReport: 'Reporte del día 2',
  },
  {
    id: 3,
    date: '2026-05-03',
    totalHours: '9 h 10 min',
    status: 'En revisión',
    iaReport: 'Reporte del día 3',
  },
]

describe('History Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
  })

  it('renderiza la cabecera y los filtros de fecha', () => {
    mockSearchParams.set('page', '1')

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    expect(screen.getByText('Historial de Reportes')).toBeInTheDocument()

    const inputsFecha = document.querySelectorAll('input[type="date"]')
    expect(inputsFecha.length).toBe(2)

    fireEvent.change(inputsFecha[0], { target: { value: '2026-05-10' } })
    expect(mockSetSearchParams).toHaveBeenCalled()

    fireEvent.change(inputsFecha[1], { target: { value: '2026-05-20' } })
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('muestra el botón "Limpiar filtros" y lo ejecuta cuando hay parámetros activos', () => {
    mockSearchParams.set('from', '2026-05-01')
    mockSearchParams.set('to', '2026-05-15')

    render(
      <BrowserRouter>
        <HistoryPage records={TEST_RECORDS} />
      </BrowserRouter>,
    )

    const botonLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i })
    fireEvent.click(botonLimpiar)
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('muestra el estado vacío cuando no hay registros', () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    expect(
      screen.getByText('No se encontraron reportes en este rango de fechas.'),
    ).toBeInTheDocument()
  })

  it('renderiza filas y permite ver y cerrar un reporte', () => {
    render(
      <BrowserRouter>
        <HistoryPage records={TEST_RECORDS} />
      </BrowserRouter>,
    )

    expect(screen.getByText('2026-05-01')).toBeInTheDocument()

    const botonesVer = screen.getAllByRole('button', { name: /Ver Reporte/i })
    fireEvent.click(botonesVer[0])

    expect(screen.getByText('Reporte del día 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }))
    expect(screen.queryByText('Reporte del día 1')).not.toBeInTheDocument()
  })

  it('botón Descargar muestra toast de "próximamente"', () => {
    render(
      <BrowserRouter>
        <HistoryPage records={TEST_RECORDS} />
      </BrowserRouter>,
    )

    const botonesDescargar = screen.getAllByRole('button', { name: /Descargar/i })
    fireEvent.click(botonesDescargar[0])

    expect(screen.getByText('Descarga disponible próximamente.')).toBeInTheDocument()
  })

  it('botón Integrar con Finnegans muestra toast de "próximamente"', () => {
    render(
      <BrowserRouter>
        <HistoryPage records={TEST_RECORDS} />
      </BrowserRouter>,
    )

    const botonesVer = screen.getAllByRole('button', { name: /Ver Reporte/i })
    fireEvent.click(botonesVer[0])

    fireEvent.click(screen.getByRole('button', { name: /Integrar con Finnegans/i }))
    expect(
      screen.getByText('Integración con Finnegans disponible próximamente.'),
    ).toBeInTheDocument()
  })

  it('la paginación navega entre páginas', () => {
    render(
      <BrowserRouter>
        <HistoryPage records={TEST_RECORDS} itemsPerPage={2} />
      </BrowserRouter>,
    )

    expect(screen.getByText(/Página/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    expect(mockSetSearchParams).toHaveBeenCalled()

    mockSearchParams.set('page', '2')
    fireEvent.click(screen.getByRole('button', { name: /Anterior/i }))
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('ejecuta el flujo de deslogueo', () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Mock Logout/i }))
    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
