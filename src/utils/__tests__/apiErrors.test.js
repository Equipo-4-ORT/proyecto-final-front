import { describe, it, expect } from 'vitest'
import { getApiErrorMessage, COMMON_ERROR_MESSAGES } from '../apiErrors'

describe('getApiErrorMessage', () => {
  it('retorna el mensaje de dominio cuando el código existe en domainMessages', () => {
    const err = { response: { data: { code: 'user_already_exists' } } }
    const domain = { user_already_exists: 'Ya existe ese usuario.' }

    expect(getApiErrorMessage(err, domain)).toBe('Ya existe ese usuario.')
  })

  it('retorna el mensaje común cuando el código está en COMMON_ERROR_MESSAGES', () => {
    const err = { response: { data: { code: 'unauthenticated' } } }

    expect(getApiErrorMessage(err)).toBe(COMMON_ERROR_MESSAGES.unauthenticated)
  })

  it('retorna el fallback cuando el código no existe en ningún mapa', () => {
    const err = { response: { data: { code: 'codigo_raro' } } }

    expect(getApiErrorMessage(err, {}, 'Error personalizado')).toBe('Error personalizado')
  })

  it('retorna unknown_error cuando no hay código de error', () => {
    expect(getApiErrorMessage({})).toBe(COMMON_ERROR_MESSAGES.unknown_error)
  })

  it('el código de dominio tiene precedencia sobre el código común', () => {
    const err = { response: { data: { code: 'unauthenticated' } } }
    const domain = { unauthenticated: 'Override de dominio.' }

    expect(getApiErrorMessage(err, domain)).toBe('Override de dominio.')
  })
})
