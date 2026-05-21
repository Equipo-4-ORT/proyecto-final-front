import { useEffect, useState } from 'react'
import { adminApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import TextInput from '../components/ui/TextInput'

const ROLE_LABELS = { ADMIN: 'Admin', EMPLOYEE: 'Empleado' }
const STATUS_LABELS = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' }

const EMPTY_FORM = { fullName: '', email: '' }

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-AR')
}

function Admin() {
  const { user, logout } = useAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [toggleError, setToggleError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await adminApi.getUsers()
      setUsers(data)
    } catch {
      setFetchError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id) => {
    setTogglingId(id)
    setToggleError(null)
    try {
      const updated = await adminApi.toggleStatus(id)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch {
      setToggleError('No se pudo actualizar el estado del usuario. Intentá de nuevo.')
    } finally {
      setTogglingId(null)
    }
  }

  const openModal = () => {
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError(null)
  }

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setFormError('Nombre y email son requeridos.')
      return
    }

    setSaving(true)
    setFormError(null)
    try {
      const newUser = await adminApi.createUser(form)
      setUsers((prev) => [newUser, ...prev])
      setModalOpen(false)
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Ocurrió un error al guardar.'
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">Panel de administración</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{user?.email}</span>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Sección usuarios */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Usuarios</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Solo los usuarios registrados acá pueden iniciar sesión con Google.
              </p>
            </div>
            <Button onClick={openModal}>+ Nuevo usuario</Button>
          </div>

          {toggleError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-red-600 text-sm">
              {toggleError}
            </div>
          )}

          {loading && (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">Cargando...</div>
          )}

          {fetchError && (
            <div className="px-6 py-10 text-center text-red-500 text-sm">{fetchError}</div>
          )}

          {!loading && !fetchError && users.length === 0 && (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">
              No hay usuarios registrados todavía.
            </div>
          )}

          {!loading && !fetchError && users.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-3 font-medium">Nombre</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Rol</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                  <th className="px-6 py-3 font-medium">Alta</th>
                  <th className="px-6 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 text-slate-800 font-medium">{u.fullName ?? '—'}</td>
                    <td className="px-6 py-3 text-slate-600">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {STATUS_LABELS[u.status] ?? u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        disabled={togglingId === u.id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50 ${
                          u.status === 'ACTIVE'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {togglingId === u.id ? '...' : u.status === 'ACTIVE' ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal nuevo usuario */}
      <Modal
        isOpen={modalOpen}
        title="Registrar nuevo usuario"
        onClose={() => setModalOpen(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
              Nombre completo
            </label>
            <TextInput
              id="fullName"
              name="fullName"
              placeholder="Ej: María García"
              value={form.fullName}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <TextInput
              id="email"
              name="email"
              type="email"
              placeholder="Ej: mgarcia@empresa.com"
              value={form.email}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {formError}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Admin
