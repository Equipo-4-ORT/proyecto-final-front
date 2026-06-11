const ROLE_LABELS = { ADMIN: 'Admin', EMPLOYEE: 'Empleado' }
const STATUS_LABELS = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' }

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-AR')
}

function UserTable({ users, onToggleStatus, onEdit, togglingId }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-100">
          <th className="px-6 py-3 font-medium">Nombre</th>
          <th className="px-6 py-3 font-medium">Email</th>
          <th className="px-6 py-3 font-medium">Rol</th>
          <th className="px-6 py-3 font-medium">Estado</th>
          <th className="px-6 py-3 font-medium">Alta</th>
          <th className="px-6 py-3 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50 transition">
            <td className="px-6 py-3 text-slate-800 font-medium">
              {u.fullName ?? '—'}
            </td>
            <td className="px-6 py-3 text-slate-600">{u.email}</td>
            <td className="px-6 py-3">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {ROLE_LABELS[u.role] ?? u.role}
              </span>
            </td>
            <td className="px-6 py-3">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {STATUS_LABELS[u.status] ?? u.status}
              </span>
            </td>
            <td className="px-6 py-3 text-slate-400">
              {formatDate(u.createdAt)}
            </td>
            <td className="px-6 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onEdit(u)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => onToggleStatus(u)}
                  disabled={togglingId === u.id}
                  className={`text-xs font-semibold px-2 py-1 rounded transition ${
                    u.status === 'ACTIVE'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {togglingId === u.id
                    ? '...'
                    : u.status === 'ACTIVE'
                      ? 'Deshabilitar'
                      : 'Habilitar'}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default UserTable
