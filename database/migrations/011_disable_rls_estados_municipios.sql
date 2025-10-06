-- =====================================================
-- MIGRAÇÃO 011: DESABILITAR RLS PARA ESTADOS E MUNICÍPIOS
-- =====================================================
-- Remove o Row Level Security das tabelas de referência geográfica
-- para permitir leitura livre sem autenticação
-- =====================================================

-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Estados são públicos para leitura" ON public.estados;
DROP POLICY IF EXISTS "Municípios são públicos para leitura" ON public.municipios;
DROP POLICY IF EXISTS "Sistema pode inserir municípios" ON public.municipios;
DROP POLICY IF EXISTS "Sistema pode atualizar municípios" ON public.municipios;
DROP POLICY IF EXISTS "Todos podem ler estados" ON public.estados;
DROP POLICY IF EXISTS "Todos podem ler municípios" ON public.municipios;

-- Desabilitar RLS nas tabelas de estados e municípios
ALTER TABLE public.estados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.estados IS 'Estados brasileiros (UF) - Tabela pública sem RLS';
COMMENT ON TABLE public.municipios IS 'Municípios brasileiros - Tabela pública sem RLS';