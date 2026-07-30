-- Rodar no SQL Editor do Supabase (projeto hzsvbkapluywtfwedlae — o usado de fato em produção)
-- Catálogo editável de Produtos e Equipamentos pelo Admin do limpline-system

create table if not exists public.catalogo_itens (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('produto', 'equipamento')),
  nome text not null,
  categoria text,
  linha text,
  codigo text,
  valor_padrao numeric,
  unidades text[] not null default array['Unidade'],
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.catalogo_itens disable row level security;

-- Carga inicial: 37 equipamentos (equipamentos_catalogo_limpo.csv)
insert into public.catalogo_itens (tipo, nome, linha, valor_padrao, ordem) values
  ('equipamento', 'Dispenser Mini Spray 400 ml', 'Linha Elegance (Branca ou Preta)', 46.0, 1),
  ('equipamento', 'Dispenser Mini Espuma 400 ml', 'Linha Elegance (Branca ou Preta)', 46.0, 2),
  ('equipamento', 'Dispenser Espuma 800 ml', 'Linha Elegance (Branca ou Preta)', 55.0, 3),
  ('equipamento', 'Suporte para Papel Higiênico Cai-Cai', 'Linha Elegance (Branca ou Preta)', 50.0, 4),
  ('equipamento', 'Suporte para Papel Higiênico Rolão', 'Linha Elegance (Branca ou Preta)', 55.0, 5),
  ('equipamento', 'Suporte para Protetor de Assento Sanitário', 'Linha Elegance (Branca ou Preta)', 18.0, 6),
  ('equipamento', 'Toalheiro Bobina Auto Corte', 'Linha Elegance (Branca ou Preta)', 240.0, 7),
  ('equipamento', 'Toalheiro Interfolha', 'Linha Elegance (Branca ou Preta)', null, 8),
  ('equipamento', 'Suporte para Descarte Plástico de Absorvente', 'Linha Elegance (Branca ou Preta)', 15.0, 9),
  ('equipamento', 'Saboneteira Espuma', 'Luxo (Branca ou Preta)', 108.0, 10),
  ('equipamento', 'Saboneteira Reservatório', 'Luxo (Branca ou Preta)', null, 11),
  ('equipamento', 'Suporte para Papel Higiênico Cai-Cai', 'Luxo (Branca ou Preta)', 40.0, 12),
  ('equipamento', 'Suporte para Papel Higiênico Rolão', 'Luxo (Branca ou Preta)', 50.0, 13),
  ('equipamento', 'Toalheiro Bobina Auto Corte', 'Luxo (Branca ou Preta)', 305.0, 14),
  ('equipamento', 'Toalheiro Interfolha', 'Luxo (Branca ou Preta)', null, 15),
  ('equipamento', 'Dispenser para Álcool Gel', 'Luxo Inox', null, 16),
  ('equipamento', 'Dispenser para Álcool Spray', 'Luxo Inox', null, 17),
  ('equipamento', 'Saboneteira Espuma', 'Luxo Inox', 108.0, 18),
  ('equipamento', 'Saboneteira Reservatório', 'Luxo Inox', 108.0, 19),
  ('equipamento', 'Suporte para Descarte Plástico de Absorvente', 'Luxo Inox', null, 20),
  ('equipamento', 'Suporte para Papel Higiênico Cai-Cai', 'Luxo Inox', null, 21),
  ('equipamento', 'Suporte para Papel Higiênico Rolão', 'Luxo Inox', null, 22),
  ('equipamento', 'Suporte para Protetor de Assento Sanitário', 'Luxo Inox', null, 23),
  ('equipamento', 'Toalheiro Bobina Auto Corte', 'Luxo Inox', 382.0, 24),
  ('equipamento', 'Toalheiro Interfolha', 'Luxo Inox', 175.0, 25),
  ('equipamento', 'Dispenser para Álcool Gel', 'Institucional (branca ou preta)', null, 26),
  ('equipamento', 'Dispenser para Álcool Spray', 'Institucional (branca ou preta)', null, 27),
  ('equipamento', 'Kit Enxaguante Bucal (Enxaguante, Fio Dental e Porta Copos)', 'Institucional (branca ou preta)', null, 28),
  ('equipamento', 'Porta Copos', 'Institucional (branca ou preta)', null, 29),
  ('equipamento', 'Saboneteira Espuma', 'Institucional (branca ou preta)', 60.0, 30),
  ('equipamento', 'Saboneteira Reservatório', 'Institucional (branca ou preta)', null, 31),
  ('equipamento', 'Suporte para Descarte Plástico de Absorvente', 'Institucional (branca ou preta)', null, 32),
  ('equipamento', 'Suporte para Papel Higiênico Cai-Cai', 'Institucional (branca ou preta)', 50.0, 33),
  ('equipamento', 'Suporte para Papel Higiênico Rolão', 'Institucional (branca ou preta)', 60.0, 34),
  ('equipamento', 'Suporte para Protetor de Assento Sanitário', 'Institucional (branca ou preta)', null, 35),
  ('equipamento', 'Toalheiro Bobina Auto Corte', 'Institucional (branca ou preta)', 230.0, 36),
  ('equipamento', 'Toalheiro Interfolha', 'Institucional (branca ou preta)', 55.0, 37);
