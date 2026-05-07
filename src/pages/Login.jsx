function Login() {
  const handleLogin = () => {
    if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_LOGIN === 'true') {
      window.location.href = '/callback?token=fake-jwt-123'
      return
    }

    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
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
