function Login() {
  const handleLogin = () => {
    // Simulación del flujo OAuth:
  // En producción, esto redirigirá al backend (ej: /auth/google)
  // que se encarga del login con Google y luego redirige a /callback con el JWT.
  // Por ahora usamos un token fake para poder desarrollar el frontend sin backend.
    window.location.href = "/callback?token=fake-jwt-123" 
  }

  return (
    <div className="flex items-center justify-center h-screen">
     <button
  type="button"
  onClick={handleLogin}
  className="px-6 py-3 bg-black text-white rounded-lg"
>
  Sign in with Google
</button>
    </div>
  )
}

export default Login