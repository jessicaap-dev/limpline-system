import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Layout({ children, title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/proposta', label: '📄 Proposta', roles: ['admin', 'vendedora'] },
    { path: '/contrato', label: '📋 Contrato', roles: ['admin', 'vendedora'] },
    { path: '/painel', label: '📊 Painel', roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role))

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB' }}>
      <div style={{ background: '#1A3A6B', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 56 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', flex: 1 }}>LIMPLINE</div>
        <nav style={{ display: 'flex', gap: 4, marginRight: '1.5rem' }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F5C400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1A3A6B' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: '#B5D4F4' }}>{user?.name}</span>
          <button onClick={handleLogout}
            style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#B5D4F4', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {title && <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1A3A6B', marginBottom: '1.5rem' }}>{title}</h1>}
        <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #E8EDF5', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
