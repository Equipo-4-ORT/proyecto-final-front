import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Toast } from '../Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza el mensaje con variante info', () => {
    const onClose = vi.fn()
    render(<Toast message="Mensaje de prueba" variant="info" onClose={onClose} />)
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument()
  })

  it('renderiza con variante success', () => {
    const onClose = vi.fn()
    render(<Toast message="Éxito" variant="success" onClose={onClose} />)
    expect(screen.getByText('Éxito')).toBeInTheDocument()
  })

  it('renderiza con variante error', () => {
    const onClose = vi.fn()
    render(<Toast message="Error" variant="error" onClose={onClose} />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('usa variante info cuando la variante es desconocida', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" variant="desconocida" onClose={onClose} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('llama onClose al hacer clic en el botón de cierre', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" variant="info" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('llama onClose automáticamente después de la duración', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" variant="info" onClose={onClose} duration={1000} />)
    act(() => vi.advanceTimersByTime(1000))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no llama onClose automáticamente si duration es 0', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" variant="info" onClose={onClose} duration={0} />)
    act(() => vi.advanceTimersByTime(10000))
    expect(onClose).not.toHaveBeenCalled()
  })
})
