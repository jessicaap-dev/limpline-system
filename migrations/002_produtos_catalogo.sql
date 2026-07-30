-- Rodar no SQL Editor do Supabase (projeto hzsvbkapluywtfwedlae — o usado em produção)
-- Carga inicial dos 22 produtos (papel, sabonete, álcool, refis, outros) na catalogo_itens

insert into public.catalogo_itens (tipo, nome, categoria, codigo, valor_padrao, unidades, ordem) values
  ('produto', 'Papel Toalha Bobina Folha Dupla 6x20x150 mts', 'Papel Toalha', '1152', 185, array['Fardo'], 1),
  ('produto', 'Papel Toalha Bobina 6x20x200 mts Celulose', 'Papel Toalha', '1026', 197, array['Fardo'], 2),
  ('produto', 'Papel Toalha Bobina 6x20x200 mts Premium', 'Papel Toalha', '1', 169, array['Fardo'], 3),
  ('produto', 'Papel Toalha Interfolha com 4.800 folhas Luxo', 'Papel Toalha', '17', 196, array['Caixa'], 4),
  ('produto', 'Papel Toalha Interfolha com 4.800 folhas Premium', 'Papel Toalha', '16', 169, array['Caixa'], 5),
  ('produto', 'Papel Toalha Interfolha Folha Dupla com 2.400 folhas', 'Papel Toalha', '14', 259, array['Fardo'], 6),
  ('produto', 'Papel Toalha Interfolha Folha Dupla com 2.000 folhas', 'Papel Toalha', '970', 133, array['Fardo'], 7),
  ('produto', 'Papel Higiênico Cai-Cai com 8.000 folhas', 'Papel Higiênico', null, null, array['Caixa'], 8),
  ('produto', 'Papel Higiênico Rolão 8x300 mts Luxo', 'Papel Higiênico', '40', 113, array['Fardo'], 9),
  ('produto', 'Papel Higiênico Rolão 8x300 mts Premium', 'Papel Higiênico', '804', 146, array['Fardo'], 10),
  ('produto', 'Papel Higiênico Rolão Folha Dupla 8x240 mts', 'Papel Higiênico', '981', 196, array['Fardo'], 11),
  ('produto', 'Sabonete Espuma Sachê', 'Sabonete', null, null, array['Caixa','Unidade'], 12),
  ('produto', 'Sabonete Espuma Antisséptico', 'Sabonete', null, null, array['Caixa','Unidade'], 13),
  ('produto', 'Sabonete Espuma Galão com 5 lts', 'Sabonete', null, null, array['Caixa','Unidade'], 14),
  ('produto', 'Sabonete Cremoso Galão com 5 lts', 'Sabonete', null, null, array['Caixa','Unidade'], 15),
  ('produto', 'Álcool Gel Sachê com 800 ml', 'Álcool', null, null, array['Caixa','Unidade'], 16),
  ('produto', 'Álcool Spray Sachê com 800 ml', 'Álcool', null, null, array['Caixa','Unidade'], 17),
  ('produto', 'Álcool Gel Galão com 5 lts', 'Álcool', null, null, array['Caixa','Unidade'], 18),
  ('produto', 'Protetor de Assento Sanitário com 86 folhas', 'Outros', null, null, array['Caixa','Pacote'], 19),
  ('produto', 'Saquinho para Absorvente com 25 unidades', 'Outros', null, null, array['Caixa','Pacote'], 20),
  ('produto', 'Refil FreeCo', 'Refis', null, null, array['Unidade'], 21),
  ('produto', 'Odorizador Refil', 'Refis', null, null, array['Unidade'], 22);
