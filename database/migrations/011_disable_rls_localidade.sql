-- =====================================================
-- MIGRAÇÃO 011: DESABILITAR RLS PARA ESTADOS E MUNICÍPIOS
-- =====================================================
-- Desabilita Row Level Security para tabelas de referência geográfica
-- Estados e municípios são dados públicos que não precisam de restrições
-- =====================================================

-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Estados são públicos para leitura" ON public.estados;
DROP POLICY IF EXISTS "Municípios são públicos para leitura" ON public.municipios;
DROP POLICY IF EXISTS "Todos podem ler estados" ON public.estados;
DROP POLICY IF EXISTS "Todos podem ler municípios" ON public.municipios;
DROP POLICY IF EXISTS "Sistema pode inserir municípios" ON public.municipios;
DROP POLICY IF EXISTS "Sistema pode atualizar municípios" ON public.municipios;

-- Desabilita RLS completamente para tabelas de referência
ALTER TABLE public.estados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.estados IS 'Estados brasileiros (UF) - Dados públicos sem RLS';
COMMENT ON TABLE public.municipios IS 'Municípios brasileiros - Dados públicos sem RLS';