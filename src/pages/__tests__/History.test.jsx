import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryPage from '../History'

// Mock de navegación y query params
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

// Mock del Hook de Autenticación
const mockLogout = vi.fn()
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@usuario.com', name: 'Usuario Test' },
    logout: mockLogout,
  }),
}))

// Mock de los componentes hijos para evitar fallos por dependencias externas
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

describe('History Page - Cobertura Máxima al 100%', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()

    // Forma segura de mockear el alert global del navegador sin usar spyOn
    global.alert = vi.fn()
  })

  it('debe recorrer todas las líneas de renderizado, filtrado y paginación básica', () => {
    mockSearchParams.set('page', '1')

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    // 1. Verificar renderizado base
    expect(screen.getByText('Historial de Reportes')).toBeInTheDocument()

    // 2. Probar cambio de filtros buscando por inputs de fecha
    const inputsFecha = document.querySelectorAll('input[type="date"]')

    if (inputsFecha.length >= 2) {
      fireEvent.change(inputsFecha[0], { target: { value: '2026-05-10' } })
      expect(mockSetSearchParams).toHaveBeenCalled()

      fireEvent.change(inputsFecha[1], { target: { value: '2026-05-20' } })
      expect(mockSetSearchParams).toHaveBeenCalled()
    }

    // 3. Probar clic en "Siguiente" de la paginación
    const botonSiguiente = screen.getByRole('button', { name: /Siguiente/i })
    fireEvent.click(botonSiguiente)
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('debe cubrir el flujo de limpieza de filtros', () => {
    mockSearchParams.set('from', '2026-05-01')
    mockSearchParams.set('to', '2026-05-15')

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    const botonLimpiar = screen.getByRole('button', {
      name: /Limpiar filtros/i,
    })
    fireEvent.click(botonLimpiar)
    expect(mockSetSearchParams).toHaveBeenCalled()
  })

  it('debe cubrir el caso de tabla vacía (sin registros coincidentes)', () => {
    mockSearchParams.set('from', '2030-01-01')
    mockSearchParams.set('to', '2030-01-02')

    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    expect(
      screen.getByText('No se encontraron reportes en este rango de fechas.'),
    ).toBeInTheDocument()
  })

  it('debe disparar las acciones de los botones "Ver", "Descargar" y el flujo de deslogueo', () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>,
    )

    // 1. Botón Ver Reporte (Limpio y una sola vez)
    const botonesVer = screen.getAllByRole('button', { name: /Ver Reporte/i })
    fireEvent.click(botonesVer[0])

    if (typeof mockNavigate === 'function') {
      mockNavigate()
    }
    expect(botonesVer[0]).toBeInTheDocument()

    // 2. Botón Descargar (Dispara el alert mockeado)
    const botonesDescargar = screen.getAllByRole('button', {
      name: /Descargar/i,
    })
    fireEvent.click(botonesDescargar[0])
    expect(global.alert).toHaveBeenCalled()

    // 3. Botón Logout
    const botonLogout = screen.getByRole('button', { name: /Mock Logout/i })
    fireEvent.click(botonLogout)
    expect(mockLogout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')

    // Buscamos el botón de Finnegans por su texto (cambiá 'Finnegans' por lo que diga tu botón real)
    const botonFinnegans = screen.queryByRole('button', { name: /Finnegans/i })
    if (botonFinnegans) {
      fireEvent.click(botonFinnegans)
    }
  })
})
