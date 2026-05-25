import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import HistoryPage from '../History'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@usuario.com', name: 'Usuario Test' },
    logout: vi.fn(),
  }),
}))

describe('History Page', () => {
  it('renders the history page correctly', () => {
    render(
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    )
    
    expect(screen.getByRole('heading', { name: /Historial de Reportes/i })).toBeInTheDocument()
  })
})