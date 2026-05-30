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
        <HistoryPage />
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

  it('ejecuta el flujo de deslogueo', () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    const botonLogout = screen.getByRole('button', { name: /Mock Logout/i })
    fireEvent.click(botonLogout)
    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
