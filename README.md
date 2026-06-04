# Limpline — Sistema Comercial

Sistema para geração de propostas e contratos de comodato.

## Funcionalidades

- Login individual por vendedora
- Gerador de proposta em PDF com seleção de produtos
- Gerador de contrato de comodato em PDF
- Painel da Jéssica com histórico completo (quem gerou, o quê e quando)

## Logins padrão (altere as senhas após o primeiro acesso)

| Nome | E-mail | Senha padrão |
|---|---|---|
| Jéssica (admin) | jessica@limplinecomercial.com.br | jessica2026 |
| Romilda | romilda@limplinecomercial.com.br | romilda2026 |
| Juliana | juliana@limplinecomercial.com.br | juliana2026 |
| Marcos | marcos@limplinecomercial.com.br | marcos2026 |
| Cintia | cintia@limplinecomercial.com.br | cintia2026 |
| Filipe | filipe@limplinecomercial.com.br | filipe2026 |
| Alessandra | alessandra@limplinecomercial.com.br | alessandra2026 |
| Sarah | sarah@limplinecomercial.com.br | sarah2026 |

## Passo a passo para publicar

### 1. Criar conta no Supabase (banco de dados)

1. Acesse https://supabase.com e crie uma conta gratuita
2. Clique em "New project"
3. Escolha um nome (ex: limpline-system) e senha
4. Após criar, vá em Settings > API
5. Copie a "Project URL" e a "anon public key"

### 2. Criar a tabela no Supabase

No painel do Supabase, vá em SQL Editor e execute:

```sql
CREATE TABLE historico (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  vendedora TEXT NOT NULL,
  cliente_nome TEXT,
  cliente_empresa TEXT,
  arquivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON historico FOR ALL USING (true) WITH CHECK (true);
```

### 3. Criar conta no Vercel (hospedagem)

1. Acesse https://vercel.com e crie uma conta gratuita com o GitHub
2. No GitHub, crie um repositório e faça upload de todos os arquivos deste projeto
3. No Vercel, clique em "Add New Project" e importe o repositório do GitHub
4. Antes de fazer deploy, configure as variáveis de ambiente:
   - REACT_APP_SUPABASE_URL = (URL copiada do Supabase)
   - REACT_APP_SUPABASE_ANON_KEY = (chave copiada do Supabase)
5. Clique em Deploy
6. O sistema ficará disponível em um link como: https://limpline-system.vercel.app

### 4. Atualizar o sistema no futuro

Qualquer alteração que a JN Digital fizer nos arquivos e fizer push para o GitHub, o Vercel atualiza automaticamente em segundos.

## Estrutura do projeto

```
src/
  lib/
    config.js    — produtos, usuários, configurações
    auth.js      — sistema de login
    pdf.js       — geração de PDFs
  pages/
    Login.js     — tela de login
    Proposta.js  — gerador de propostas
    Contrato.js  — gerador de contratos
    Painel.js    — painel da Jéssica
  components/
    Layout.js    — barra de navegação e layout
```
