import { useLocation } from 'react-router-dom'

const ERROR_MESSAGES = {
  access_denied: 'Cancelaste el inicio de sesión.',
  insufficient_scopes: 'Tenés que aceptar todos los permisos requeridos (Calendar, Sheets y Docs) para poder usar la app.',
  auth_failed: 'Ocurrió un error al iniciar sesión. Intentá de nuevo.',
  missing_code: 'No se recibió respuesta de Google. Intentá de nuevo.',
  unauthorized_user: 'Tu cuenta no está habilitada. Contactá al administrador.',
  user_not_active: 'Tu cuenta está deshabilitada. Contactá al administrador.',
}

function Login() {
  const location = useLocation()
  const errorParam = new URLSearchParams(location.search).get('error')
  const errorMessage = ERROR_MESSAGES[errorParam] ?? null

  const handleLogin = () => {
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
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

      </div>
    </div>
  )
}

export default Login
