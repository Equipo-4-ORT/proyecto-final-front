import { useState } from 'react'

import api from '../services/api'

function Admin() {
  const [adminKey, setAdminKey] = useState('')
  const [validated, setValidated] = useState(false)
  const [keyError, setKeyError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleValidate = async (e) => {
    e.preventDefault()
    setKeyError('')
    setIsValidating(true)

    try {
      await api.post('/admin/validate-key', { key: adminKey })
      setValidated(true)
    } catch (err) {
      const status = err.response?.status
      if (status === 401 || status === 403) {
        setKeyError('Clave inválida.')
      } else {
        setKeyError('Error al validar la clave. Intentá de nuevo.')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess(false)
    setIsSubmitting(true)

    try {
      await api.post('/admin/users', formData)
      setFormSuccess(true)
      setFormData({ name: '', email: '', password: '' })
    } catch (err) {
      const status = err.response?.status
      if (status === 409) {
        setFormError('El email ya está registrado.')
      } else if (status === 400) {
        setFormError(err.response?.data?.message || 'Datos inválidos.')
      } else {
        setFormError('Error al crear el administrador. Intentá de nuevo.')
      }
    } finally {
      setIsSubmitting(false)
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

          <button
            type="submit"
            disabled={isValidating}
            className="rounded bg-black p-3 text-white disabled:opacity-50"
          >
            {isValidating ? 'Validando...' : 'Validar'}
          </button>

          {keyError && <p className="text-sm text-red-500">{keyError}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleCreateAdmin}
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-8 shadow"
      >
        <h1 className="text-2xl font-bold">Crear administrador</h1>

        <input
          type="text"
          placeholder="Nombre"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="rounded border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="rounded border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          className="rounded border p-3"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Creando...' : 'Crear admin'}
        </button>

        {formError && <p className="text-sm text-red-500">{formError}</p>}
        {formSuccess && (
          <p className="text-sm text-green-600">Administrador creado con éxito.</p>
        )}
      </form>
    </div>
  )
}

export default Admin
