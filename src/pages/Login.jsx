import { useLocation } from 'react-router-dom'

const ERROR_MESSAGES = {
  access_denied: 'Cancelaste el inicio de sesión.',
  insufficient_scopes: 'Tenés que aceptar todos los permisos requeridos (Calendar, Sheets y Docs) para poder usar la app.',
  auth_failed: 'Ocurrió un error al iniciar sesión. Intentá de nuevo.',
  missing_code: 'No se recibió respuesta de Google. Intentá de nuevo.',
}

function Login() {
  const location = useLocation()
  const errorParam = new URLSearchParams(location.search).get('error')
  const errorMessage = ERROR_MESSAGES[errorParam] ?? null

  const handleLogin = () => {
    const useMockLogin = import.meta.env.VITE_USE_MOCK_LOGIN === 'true'

    if (useMockLogin) {
      window.location.href = '/callback?token=header.payload.signature'
      return
    }

    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido</h1>
          <p className="text-sm text-slate-500">Iniciá sesión para continuar</p>
        </div>

        {errorMessage && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-center leading-relaxed">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-slate-300 rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition text-slate-700 font-medium text-sm"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continuar con Google
        </button>

      </div>
    </div>
  )
}

export default Login
