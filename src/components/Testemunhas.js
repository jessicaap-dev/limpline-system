import React, { useState } from 'react'

const KEY = 'limpline_testemunhas'
const VAZIO = [{ nome: '', cpf: '' }, { nome: '', cpf: '' }]

function carregar() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(v) && v.length === 2) return v
  } catch (e) { /* sem storage */ }
  return VAZIO
}

export function useTestemunhas() {
  const [testemunhas, setState] = useState(carregar)
  function setTestemunhas(v) {
    setState(v)
    try { localStorage.setItem(KEY, JSON.stringify(v)) } catch (e) { /* ignora */ }
  }
  return [testemunhas, setTestemunhas]
}

export default function Testemunhas({ testemunhas, onChange }) {
  const set = (i, k, val) => onChange(testemunhas.map((t, j) => j === i ? { ...t, [k]: val } : t))
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A6B', marginBottom: 2 }}>Testemunhas do contrato</div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Ficam salvas neste computador. Deixe em branco para assinar à mão.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {testemunhas.map((t, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input placeholder={'Testemunha ' + (i + 1) + ' - nome'} value={t.nome} onChange={e => set(i, 'nome', e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
            <input placeholder="CPF" value={t.cpf} onChange={e => set(i, 'cpf', e.target.value)}
              style={{ padding: '8px 10px', borderRadius: 8, border: '0.5px solid #D0D8EC', fontSize: 13 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
