-- Rodar no SQL Editor do Supabase (projeto hzsvbkapluywtfwedlae — o usado de fato em produção)
-- Controle manual de estoque físico de equipamentos, transitório até a troca
-- pro ERP (W3ERP). Total de unidades e valor investido são calculados no
-- app (avulsas + caixas×unidades_por_caixa; total×custo_unitario) — não
-- guardados aqui, pra nunca ficarem dessincronizados do que foi digitado.

create table if not exists public.estoque_equipamentos (
  id uuid primary key default gen_random_uuid(),
  equipamento text not null,
  cor text,
  marca text not null default 'Fortcom',
  qtd_avulsa integer not null default 0,
  qtd_caixas integer not null default 0,
  unidades_por_caixa integer not null default 1,
  -- Custo unitário só é preenchido/editado pela Jéssica (ver Estoque.js) —
  -- fica nulo até ela cadastrar item a item.
  custo_unitario numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.estoque_equipamentos disable row level security;

create index if not exists estoque_equipamentos_equipamento_idx on public.estoque_equipamentos (equipamento);
