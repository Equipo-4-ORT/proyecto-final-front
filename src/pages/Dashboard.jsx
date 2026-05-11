import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

function Dashboard() {
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()

    navigate('/login')
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <p className="mb-4">Usuario autenticado</p>

      <pre className="mb-6 bg-gray-100 p-4 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>

      <button
        type="button"
        onClick={handleLogout}
        className="px-6 py-3 bg-red-500 text-white rounded-lg"
      >
        Logout
      </button>
    </div>
  )
}

export default Dashboard