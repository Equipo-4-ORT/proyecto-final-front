import { useState } from 'react'

function Admin() {
  const [adminKey, setAdminKey] = useState('')
  const [validated, setValidated] = useState(false)
  const [error, setError] = useState('')

  const handleValidate = async (e) => {
    e.preventDefault()

    setError('')

    // MOCK TEMPORAL
    if (adminKey === 'test') {
      setValidated(true)
    } else {
      setError('Clave inválida')
    }
  }

  if (!validated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <form
          onSubmit={handleValidate}
          className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-8 shadow"
        >
          <h1 className="text-2xl font-bold">Registro Admin</h1>

          <input
            type="password"
            placeholder="Ingresar X-Admin-Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            className="rounded border p-3"
          />

          <button type="submit" className="rounded bg-black p-3 text-white">
            Validar
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-8 shadow">
        <h1 className="text-2xl font-bold">Crear administrador</h1>

        <input
          type="text"
          placeholder="Nombre"
          className="rounded border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="rounded border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          className="rounded border p-3"
        />

        <button type="submit" className="rounded bg-black p-3 text-white">
          Crear admin
        </button>
      </form>
    </div>
  )
}

export default Admin
