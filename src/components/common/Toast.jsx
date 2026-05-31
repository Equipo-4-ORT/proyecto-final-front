import { X, AlertCircle, CheckCircle } from 'lucide-react'

function Toast({ message, type = 'info', onClose }) {
  const bgColor = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  }[type]

  const textColor = {
    success: 'text-emerald-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }[type]

  const Icon = type === 'error' ? AlertCircle : CheckCircle

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border ${bgColor} flex items-start gap-3 shadow-lg z-50`}
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${textColor}`} />

      <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>

      <button
        onClick={onClose}
        className={`flex-shrink-0 mt-0.5 ${textColor} hover:opacity-70 transition`}
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default Toast
