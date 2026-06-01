import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings } from 'lucide-react'

function UserMenu({ user, onLogout }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  function toggleMenu() {
    setIsOpen((prev) => !prev)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    if (onLogout) onLogout()
    navigate('/login')
  }

  return (
    <div ref={menuRef} className="relative ml-2">
      <button
        type="button"
        onClick={toggleMenu}
        className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-slate-100 transition"
      >
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-800">{user?.name || 'Usuario'}</p>
          <p className="text-xs text-slate-500">{user?.email || 'Sin email'}</p>
        </div>
        <ChevronDown size={18} className={`text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[240px] rounded-2xl border border-slate-200 bg-white shadow-xl p-3 z-50">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => { navigate('/settings'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 hover:bg-slate-50 transition"
            >
              <Settings size={18} />
              <span className="font-medium">Configuración</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={18} />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu