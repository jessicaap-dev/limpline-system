async function fetchJson(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } finally { clearTimeout(t) }
}

const fmtEndereco = (logr, num, bairro, mun, uf, cep) =>
  `${logr || ''}, ${num || 'S/N'} – ${bairro || ''}, ${mun || ''}/${uf || ''} – CEP ${cep || ''}`

function provedores(n) {
  return [
    async () => {
      const d = await fetchJson(`https://brasilapi.com.br/api/cnpj/v1/${n}`)
      if (!d.razao_social) throw new Error('vazio')
      return { empresa: d.nome_fantasia || d.razao_social, endereco: fmtEndereco(d.logradouro, d.numero, d.bairro, d.municipio, d.uf, d.cep) }
    },
    async () => {
      const d = await fetchJson(`https://publica.cnpj.ws/cnpj/${n}`)
      const e = d.estabelecimento
      if (!d.razao_social || !e) throw new Error('vazio')
      return { empresa: e.nome_fantasia || d.razao_social, endereco: fmtEndereco(e.logradouro, e.numero, e.bairro, e.cidade && e.cidade.nome, e.estado && e.estado.sigla, e.cep) }
    },
    async () => {
      const d = await fetchJson(`https://minhareceita.org/${n}`)
      if (!d.razao_social) throw new Error('vazio')
      return { empresa: d.nome_fantasia || d.razao_social, endereco: fmtEndereco(d.logradouro, d.numero, d.bairro, d.municipio, d.uf, d.cep) }
    },
    async () => {
      const d = await fetchJson(`https://receitaws.com.br/v1/cnpj/${n}`)
      if (!d.nome) throw new Error('vazio')
      return { empresa: d.fantasia || d.nome, endereco: fmtEndereco(d.logradouro, d.numero, d.bairro, d.municipio, d.uf, d.cep) }
    },
  ]
}

async function tentar(n) {
  for (const p of provedores(n)) {
    try { return await p() } catch (e) { /* tenta o próximo */ }
  }
  return null
}

function cnpjMatriz(n) {
  const base = n.slice(0, 8) + '0001'
  const dv = arr => {
    const w = arr.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2]
    const s = arr.reduce((a, v, i) => a + v * w[i], 0) % 11
    return s < 2 ? 0 : 11 - s
  }
  const d = base.split('').map(Number)
  d.push(dv(d)); d.push(dv(d))
  return d.join('')
}

// Retorna { empresa, endereco, aviso? } ou null
export async function buscarDadosCNPJ(cnpj) {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14) return null
  const r = await tentar(n)
  if (r) return r
  const m = cnpjMatriz(n)
  if (m !== n) {
    const rm = await tentar(m)
    if (rm) return { empresa: rm.empresa, endereco: '', aviso: 'Esta filial ainda não aparece nas bases públicas da Receita. Preenchi só o nome da empresa (da matriz); informe o endereço da filial manualmente.' }
  }
  return null
}

export const MSG_CNPJ_FALHA = 'Não consegui buscar esse CNPJ nas bases públicas da Receita (pode ser um CNPJ muito novo ou os serviços estão instáveis). Preencha empresa e endereço manualmente.'
