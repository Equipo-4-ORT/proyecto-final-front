import { useContext } from 'react'
import { AuthContext } from '../../contexts/auth-context'
import { useActivityData } from "../../hooks/useActivityData";
import Sidebar from './Sidebar'
import Header from './Header'

function AppLayout({ children, sourceCounts, ...props }) {
  const { sourceCounts: contextSourceCounts } = useActivityData()
  const { user, logout } = useContext(AuthContext)
  const finalSourceCounts = sourceCounts || contextSourceCounts || {}
  

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar sourceCounts={finalSourceCounts} {...props} />

      <div className="min-h-screen flex flex-col md:ml-64">
        <Header user={user} onLogout={logout} {...props} />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
