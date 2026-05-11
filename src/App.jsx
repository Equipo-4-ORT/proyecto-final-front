import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PrivateRoute from './components/PrivateRoute'

import Admin from './pages/Admin'
import Callback from './pages/Callback'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />

  <Route path="/login" element={<Login />} />

  <Route path="/callback" element={<Callback />} />

  <Route
    path="/dashboard"
    element={
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <PrivateRoute>
        <Admin />
      </PrivateRoute>
    }
  />

  <Route path="*" element={<NotFound />} />
</Routes>
    </BrowserRouter>
  )
}

export default App