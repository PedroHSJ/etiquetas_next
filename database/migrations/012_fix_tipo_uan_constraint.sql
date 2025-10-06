-- Migration: 012_fix_tipo_uan_constraint
-- Descrição: Corrige a constraint de tipo_uan para aceitar os valores corretos do frontend

-- Remover a constraint antiga
ALTER TABLE public.organizacoes DROP CONSTRAINT IF EXISTS organizacoes_tipo_uan_check;

-- Adicionar a constraint com os valores corretos
ALTER TABLE public.organizacoes ADD CONSTRAINT organizacoes_tipo_uan_check 
CHECK (tipo_uan IN (
  'restaurante_comercial', 
  'restaurante_institucional', 
  'lanchonete', 
  'padaria', 
  'cozinha_industrial', 
  'catering', 
  'outro'
));

-- Comentário atualizado
COMMENT ON COLUMN public.organizacoes.tipo_uan IS 'Tipo da UAN: restaurante_comercial, restaurante_institucional, lanchonete, padaria, cozinha_industrial, catering, outro';