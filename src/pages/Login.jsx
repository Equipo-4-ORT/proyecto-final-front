function Login() {
  const handleLogin = () => {
    const useMockLogin =
      import.meta.env.VITE_USE_MOCK_LOGIN === 'true'

    if (useMockLogin) {
      window.location.href =
        '/callback?token=header.payload.signature'

      return
    }

    window.location.href =
      `${import.meta.env.VITE_API_URL}/auth/google`
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        type="button"
        onClick={handleLogin}
      >
        Sign in with Google
      </button>
    </div>
  )
}

export default Login
