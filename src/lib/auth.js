import React, { createContext, useContext, useState, useEffect } from 'react'
import { USERS } from './config'

const AuthContext = createContext(null)

const PASSWORDS = {
  'jessica@limplinecomercial.com.br': 'jessica2026',
  'romilda@limplinecomercial.com.br': 'romilda2026',
  'juliana@limplinecomercial.com.br': 'juliana2026',
  'marcos@limplinecomercial.com.br': 'marcos2026',
  'cintia@limplinecomercial.com.br': 'cintia2026',
  'filipe@limplinecomercial.com.br': 'filipe2026',
  'alessandra@limplinecomercial.com.br': 'alessandra2026',
  'sarah@limplinecomercial.com.br': 'sarah2026',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('limpline_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(email, password) {
    const u = USERS.find(u => u.email === email)
    if (!u) return { error: 'Usuário não encontrado.' }
    if (PASSWORDS[email] !== password) return { error: 'Senha incorreta.' }
    setUser(u)
    localStorage.setItem('limpline_user', JSON.stringify(u))
    return { user: u }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('limpline_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
