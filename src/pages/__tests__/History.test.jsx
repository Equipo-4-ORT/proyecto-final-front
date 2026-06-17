import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryPage from '../History'

// NUEVO: Importamos la función directamente para poder modificar su respuesta en los tests
import { getHistory } from '../../services/reportsService'

// 1. Mocks de React Router
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

// 2. Mocks de Hooks
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

// 3. Mock de la API (SOLUCIÓN AL ERROR DE HOISTING)
// Primero declaramos el mock vacío para que Vitest lo eleve sin problemas
vi.mock('../../services/reportsService', () => ({
  getHistory: vi.fn()
}))

// Luego declaramos los datos
const TEST_RECORDS = [
  {
    id: 1,
    date: '2026-05-01',
    totalHours: '7 h 30 min',
    status: 'Aprobado',
    xlsxUrl: 'http://docs.google.com/test1'
  },
  {
    id: 2,
    date: '2026-05-02',
    totalHours: '8 h 0 min',
    status: 'Pendiente',
    xlsxUrl: null
  },
  {
    id: 3,
    date: '2026-05-03',
    totalHours: '9 h 10 min',
    status: 'En revisión',
    xlsxUrl: 'http://docs.google.com/test3'
  },
]


describe('History Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    
    // Inyectamos la respuesta por defecto ANTES de cada test, donde TEST_RECORDS ya existe
    getHistory.mockResolvedValue({
      data: TEST_RECORDS,
      meta: {
        total: 3,
        page: 1,
        totalPages: 2 // Forzamos 2 páginas para que la paginación aparezca
      }
    })
  })

  it('renderiza la cabecera y los filtros de fecha', async () => {
    mockSearchParams.set('page', '1')

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    expect(screen.getByText('Historial de Reportes')).toBeInTheDocument()

    // Esperamos a que termine de cargar
    await waitFor(() => {
      expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument()
    })

    const inputsFecha = document.querySelectorAll('input[type="date"]')
    expect(inputsFecha.length).toBe(2)

    fireEvent.change(inputsFecha[0], { target: { value: '2026-05-10' } })
    expect(mockSetSearchParams).toHaveBeenCalled()

    fireEvent.change(inputsFecha[1], { target: { value: '2026-05-20' } })
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('muestra el botón "Limpiar filtros" y lo ejecuta cuando hay parámetros activos', async () => {
    mockSearchParams.set('from', '2026-05-01')
    mockSearchParams.set('to', '2026-05-15')

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument()
    })

    const botonLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i })
    fireEvent.click(botonLimpiar)
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('muestra el estado vacío cuando no hay registros', async () => {
    // Sobrescribimos el mock SÓLO para este test, devolviendo un array vacío
    getHistory.mockResolvedValueOnce({ data: [], meta: { total: 0, totalPages: 1 } })

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('No se encontraron reportes en este rango de fechas.')).toBeInTheDocument()
    })
  })

  it('renderiza filas y permite ver y cerrar un reporte', async () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('2026-05-01')).toBeInTheDocument()
    })

    const botonesVer = screen.getAllByRole('button', { name: /Ver Detalles/i })
    fireEvent.click(botonesVer[0])

    expect(screen.getByText(/Reporte del 2026-05-01/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }))
    expect(screen.queryByText(/Reporte del 2026-05-01/i)).not.toBeInTheDocument()
  })

  it('botón Ver Excel deshabilita si no hay xlsxUrl y ejecuta window.open si lo hay', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
    
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument()
    })

    const botonesDescargar = screen.getAllByRole('button', { name: /Ver Excel/i })
    
    // El segundo elemento de TEST_RECORDS no tiene xlsxUrl, su botón debe estar deshabilitado
    expect(botonesDescargar[1]).toBeDisabled()

    // El primer elemento sí tiene, debe llamar a window.open
    fireEvent.click(botonesDescargar[0])
    expect(windowOpenSpy).toHaveBeenCalledWith('http://docs.google.com/test1', '_blank', 'noopener,noreferrer')
    
    windowOpenSpy.mockRestore()
  })

  it('botón Integrar con Finnegans muestra toast de "próximamente"', async () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument()
    })

    const botonesVer = screen.getAllByRole('button', { name: /Ver Detalles/i })
    fireEvent.click(botonesVer[0])

    fireEvent.click(screen.getByRole('button', { name: /Integrar con Finnegans/i }))
    expect(
      screen.getByText('Integración con Finnegans disponible próximamente.'),
    ).toBeInTheDocument()
  })

  it('la paginación navega entre páginas', async () => {
    render(
      <BrowserRouter>
        <HistoryPage itemsPerPage={2} />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Página/)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Siguiente/i }))
    expect(mockSetSearchParams).toHaveBeenCalled()

    mockSearchParams.set('page', '2')
    fireEvent.click(screen.getByRole('button', { name: /Anterior/i }))
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('ejecuta el flujo de deslogueo', async () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    await waitFor(() => {
      expect(screen.queryByText('Cargando historial...')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Mock Logout/i }))
    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})