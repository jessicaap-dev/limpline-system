import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const result = login(email.trim(), password)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    navigate(result.user.role === 'admin' ? '/painel' : '/proposta')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ background: '#1A3A6B', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>LIMPLINE COMERCIAL</div>
          <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 4 }}>Dispensers · Papéis · Comodato</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, border: '0.5px solid #E8EDF5', padding: '2rem' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1A3A6B', marginBottom: '1.5rem' }}>Acesso ao sistema</div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@limplinecomercial.com.br" required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 14, background: '#F8FAFF', color: '#1A1A2E', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Senha</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 14, background: '#F8FAFF', color: '#1A1A2E', boxSizing: 'border-box' }}
              />
            </div>
            {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: '1rem' }}>{error}</div>}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: '#1A3A6B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: '1rem' }}>
          Sistema desenvolvido por JN Digital Group
        </div>
      </div>
    </div>
  )
}
