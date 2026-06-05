import AppLayout from "../components/layout/AppLayout"

import Card from "../components/ui/Card"

import { useAuth } from "../hooks/useAuth"

function formatRole(role) {
  if (role === "admin") {
    return "Administrador"
  }

  return "Empleado"
}

function Profile() {
  const { user, logout } = useAuth()

  return (
    <AppLayout
      user={user}
      onLogout={logout}
      sourceCounts={{}}
    >
      <div className="max-w-3xl mx-auto">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className="
                w-24 h-24 rounded-full
                bg-slate-200
                flex items-center justify-center
                text-3xl font-bold text-slate-600
              "
            >
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-800">
                {user?.name ?? "Usuario"}
              </h1>

              <p className="mt-1 text-slate-500">
                {user?.email}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                <span
                  className="
                    inline-flex items-center rounded-full
                    bg-slate-100 px-3 py-1
                    text-sm font-medium text-slate-700
                  "
                >
                  {formatRole(user?.role)}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    ID de usuario
                  </p>

                  <p className="text-slate-800 break-all">
                    {user?.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Fecha de alta
                  </p>

                  <p className="text-slate-800">
                    Próximamente disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Profile