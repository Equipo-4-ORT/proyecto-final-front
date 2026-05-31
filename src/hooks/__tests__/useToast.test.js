import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useToast } from '../useToast'

describe('useToast', () => {
  it('estado inicial es null', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast).toBeNull()
  })

  it('showToast establece el mensaje y variante', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Hola', 'success')
    })
    expect(result.current.toast).toEqual({ message: 'Hola', variant: 'success' })
  })

  it('showToast usa variante "info" por defecto', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Mensaje')
    })
    expect(result.current.toast.variant).toBe('info')
  })

  it('hideToast limpia el estado del toast', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast('Mensaje', 'error')
    })
    act(() => {
      result.current.hideToast()
    })
    expect(result.current.toast).toBeNull()
  })
})
