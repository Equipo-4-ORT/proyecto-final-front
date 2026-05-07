import Sidebar from "./Sidebar"
import Header from "./Header"

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <div className="ml-64 min-h-screen flex flex-col">
        <Header />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout