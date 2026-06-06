import { useContext } from 'react'
import { AuthContext } from '../../contexts/auth-context'
import Sidebar from './Sidebar'
import Header from './Header'

function AppLayout({ children, ...props }) {
  const { user, logout } = useContext(AuthContext) || {}

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar {...props} sourceCounts={props.sourceCounts || {}} />

      <div className="min-h-screen flex flex-col md:ml-64">
        <Header {...props} user={user} onLogout={logout} />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
