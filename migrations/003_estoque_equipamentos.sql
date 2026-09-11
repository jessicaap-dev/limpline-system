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

-- Carga inicial (estoque_equipamentos_atual.csv, 20 combinações, 531
-- unidades no total). O CSV não separa "nº de caixas" de "unidades por
-- caixa" — só dá o total já em unidades pra cada origem (Avulso/Caixa
-- fechada) — então unidades_por_caixa entra como 1 e qtd_caixas carrega
-- esse total direto; dá pra ajustar depois se quiser detalhar por caixa.
insert into public.estoque_equipamentos (equipamento, cor, marca, qtd_avulsa, qtd_caixas, unidades_por_caixa) values
  ('Saboneteira Espuma', 'Preta', 'Fortcom', 22, 6, 1),
  ('Saboneteira Espuma', 'Velada', 'Fortcom', 12, 57, 1),
  ('Saboneteira Líquida', 'Branca', 'Fortcom', 2, 0, 1),
  ('Saboneteira Líquida', 'Preta', 'Fortcom', 33, 0, 1),
  ('Saboneteira Líquida', 'Velada', 'Fortcom', 2, 6, 1),
  ('Saboneteira Mini Líquida', 'Velada', 'Fortcom', 11, 0, 1),
  ('Saboneteira Mini Espuma', 'Velada', 'Fortcom', 2, 0, 1),
  ('Interfolha', 'Preto', 'Fortcom', 12, 12, 1),
  ('Interfolha', 'Velado', 'Fortcom', 8, 18, 1),
  ('Higiênico Rolão', 'Preto', 'Fortcom', 15, 30, 1),
  ('Higiênico Rolão', 'Velado', 'Fortcom', 12, 48, 1),
  ('Porta Copos Café', 'Preto', 'Fortcom', 0, 14, 1),
  ('Porta Copos Café', 'Branco', 'Fortcom', 0, 15, 1),
  ('Fio Dental', 'Branco', 'Fortcom', 0, 18, 1),
  ('Enxaguante', 'Branco', 'Fortcom', 0, 36, 1),
  ('Reservatório Espuma', 'Preta', 'Fortcom', 0, 36, 1),
  ('Cai-Cai', 'Preto', 'Fortcom', 0, 12, 1),
  ('Cai-Cai', 'Velado', 'Fortcom', 0, 18, 1),
  ('Auto Corte', 'Velado', 'Fortcom', 0, 51, 1),
  ('Auto Corte', 'Preto', 'Fortcom', 0, 23, 1);
