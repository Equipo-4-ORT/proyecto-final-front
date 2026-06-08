import { useCallback, useEffect, useState } from 'react'
import { adminApi } from '../services/adminApi'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiErrors'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import TextInput from '../components/ui/TextInput'
import UserTable from './Admin/components/UserTable'
import { Toast } from '../components/ui/Toast'

const ADMIN_ERROR_MESSAGES = {
  user_already_exists: 'Ya existe un usuario con ese email.',
  invalid_email: 'El formato del email no es válido.',
}

const EMPTY_FORM = { fullName: '', email: '', role: 'EMPLOYEE' }

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
  const [toast, setToast] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [userToToggle, setUserToToggle] = useState(null)

  const fetchUsers = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleStatus = async (id) => {
    setTogglingId(id)
    setToggleError(null)
    try {
      const updated = await adminApi.toggleStatus(id)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } catch {
      setToggleError('No se pudo actualizar el estado del usuario.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleOpenToggle = (user) => {
    setUserToToggle(user)
  }

  const handleConfirmToggle = async () => {
    if (userToToggle) {
      await handleToggleStatus(userToToggle.id)
      setUserToToggle(null)
    }
  }

  const handleOpenCreate = () => {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setForm({ fullName: user.fullName, email: user.email, role: user.role })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (formError) setFormError(null)
  }

  const handleSubmit = async () => {
    // 1. Limpieza básica
    const email = form.email.trim()
    const fullName = form.fullName.trim()

    if (!fullName || !email) {
      setFormError('Nombre y email son requeridos.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setFormError('El formato del email no es válido.')
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        const updatedUser = await adminApi.updateUser(editingUser.id, form)
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        )
        setToast({
          message: 'Usuario actualizado correctamente',
          variant: 'success',
        })
      } else {
        const newUser = await adminApi.createUser(form)
        setUsers((prev) => [newUser, ...prev])
        setToast({
          message: 'Usuario creado correctamente',
          variant: 'success',
        })
      }
      setModalOpen(false)
      setForm(EMPTY_FORM)
      setEditingUser(null)
    } catch (err) {
      setFormError(
        getApiErrorMessage(err, ADMIN_ERROR_MESSAGES, 'Error al guardar.'),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800">
          Panel de administración
        </h1>
        <Button variant="outline" onClick={logout}>
          Cerrar sesión
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Usuarios</h2>
            <Button onClick={handleOpenCreate}>+ Nuevo usuario</Button>
          </div>

          {toggleError && (
            <div className="p-4 text-red-600 bg-red-50 text-sm">
              {toggleError}
            </div>
          )}
          {loading && (
            <div className="p-10 text-center text-slate-400">Cargando...</div>
          )}
          {fetchError && (
            <div className="p-10 text-center text-red-500">{fetchError}</div>
          )}

          {!loading && !fetchError && users.length > 0 && (
            <UserTable
              users={users}
              onToggleStatus={handleOpenToggle}
              onEdit={handleEdit}
              togglingId={togglingId}
            />
          )}
        </div>
      </main>

      <Modal
        isOpen={modalOpen}
        title={editingUser ? 'Editar usuario' : 'Registrar nuevo usuario'}
        onClose={() => {
          setModalOpen(false)
          setEditingUser(null)
        }}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false)
                setEditingUser(null)
              }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextInput
            label="Nombre completo"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            disabled={saving}
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={saving}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
            >
              <option value="EMPLOYEE">Empleado</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {formError}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!userToToggle}
        title="Confirmar acción"
        onClose={() => setUserToToggle(null)}
        actions={
          <>
            <Button variant="outline" onClick={() => setUserToToggle(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmToggle}>Confirmar</Button>
          </>
        }
      >
        <p className="text-slate-600">
          ¿Estás seguro que deseas{' '}
          {userToToggle?.status === 'ACTIVE' ? 'deshabilitar' : 'habilitar'} a
          <strong> {userToToggle?.fullName}</strong>?
        </p>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Admin
