import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Admin from './pages/Admin'
import Callback from './pages/Callback'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import HistoryPage from './pages/History'
import Settings from './pages/Settings'
import { ActivityProvider } from './contexts/ActivityContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<Callback />} />

          <Route
            element={
              <PrivateRoute>
                <ActivityProvider>
                  <Outlet />
                </ActivityProvider>
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <ActivityProvider>
                  <Admin />
                </ActivityProvider>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
