// Mensajes para códigos de error compartidos entre integraciones.
// Para errores específicos de un dominio (ej. Jira, Admin) definí un objeto
// local y pasalo como segundo argumento a getApiErrorMessage.
export const COMMON_ERROR_MESSAGES = {
  unauthenticated: 'Sesión expirada. Volvé a iniciar sesión.',
  user_not_found: 'No encontramos tu usuario en el sistema.',
  unknown_error: 'Ocurrió un error inesperado.',
}

/**
 * Traduce un error de API a un mensaje legible para el usuario.
 *
 * @param {unknown} err               Error capturado en el catch
 * @param {Record<string,string>} domainMessages  Mensajes específicos del dominio
 * @param {string} fallback           Mensaje si el código no está mapeado
 */
export function getApiErrorMessage(
  err,
  domainMessages = {},
  fallback = COMMON_ERROR_MESSAGES.unknown_error,
) {
  const code = err?.response?.data?.code
  return domainMessages[code] ?? COMMON_ERROR_MESSAGES[code] ?? fallback
}
