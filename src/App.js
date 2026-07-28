import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Login from './pages/Login'
import Proposta from './pages/Proposta'
import Contrato from './pages/Contrato'
import Painel from './pages/Painel'
import AdminCatalogo from './pages/AdminCatalogo'

function PrivateRoute({ children, adminOnly }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/proposta" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/painel' : '/proposta'} /> : <Login />} />
      <Route path="/proposta" element={<PrivateRoute><Proposta /></PrivateRoute>} />
      <Route path="/contrato" element={<PrivateRoute><Contrato /></PrivateRoute>} />
      <Route path="/painel" element={<PrivateRoute adminOnly><Painel /></PrivateRoute>} />
      <Route path="/catalogo" element={<PrivateRoute adminOnly><AdminCatalogo /></PrivateRoute>} />
      <Route path="*" element={<Navigate to={user ? '/proposta' : '/login'} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
