import { useEffect } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

const VARIANTS = {
  success: {
    container: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
    icon: CheckCircle2,
    iconClass: 'text-emerald-400',
  },
  error: {
    container: 'bg-red-900/90 border-red-700 text-red-100',
    icon: XCircle,
    iconClass: 'text-red-400',
  },
  info: {
    container: 'bg-slate-800/90 border-slate-700 text-slate-100',
    icon: Info,
    iconClass: 'text-blue-400',
  },
}

export function Toast({ message, variant = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!duration) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const style = VARIANTS[variant] ?? VARIANTS.info
  const Icon = style.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm max-w-sm ${style.container}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-0.5 hover:bg-white/10 transition"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  )
}
