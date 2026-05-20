const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700 border-green-200',
  review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
}

const STATUS_LABELS = {
  approved: 'Aprobado',
  review: 'En revisión',
  pending: 'Pendiente',
}

const DEFAULT_STYLE = 'bg-gray-100 text-gray-500 border-gray-200'
const DEFAULT_LABEL = 'Desconocido'

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? DEFAULT_STYLE}`}
    >
      {STATUS_LABELS[status] ?? DEFAULT_LABEL}
    </span>
  )
}

export default StatusBadge
