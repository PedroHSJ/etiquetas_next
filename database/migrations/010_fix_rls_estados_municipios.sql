-- =====================================================
-- MIGRAÇÃO 010: CORREÇÃO POLÍTICAS RLS PARA ESTADOS E MUNICÍPIOS
-- =====================================================
-- Permite leitura pública das tabelas de referência geográfica
-- para funcionar corretamente com o LocalidadeSelector
-- =====================================================

-- Remove políticas existentes que exigem autenticação
DROP POLICY IF EXISTS "Todos podem ler estados" ON public.estados;
DROP POLICY IF EXISTS "Todos podem ler municípios" ON public.municipios;

-- Cria novas políticas que permitem leitura pública
-- Estados: leitura livre (tabela de referência)
CREATE POLICY "Estados são públicos para leitura" ON public.estados
    FOR SELECT USING (true);

-- Municípios: leitura livre (tabela de referência)  
CREATE POLICY "Municípios são públicos para leitura" ON public.municipios
    FOR SELECT USING (true);

-- Manter restrições de inserção apenas para usuários autenticados
CREATE POLICY "Sistema pode inserir municípios" ON public.municipios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir update de municípios apenas para sistema autenticado
CREATE POLICY "Sistema pode atualizar municípios" ON public.municipios
    FOR UPDATE USING (auth.uid() IS NOT NULL);

COMMENT ON POLICY "Estados são públicos para leitura" ON public.estados IS 'Estados brasileiros são dados de referência pública';
COMMENT ON POLICY "Municípios são públicos para leitura" ON public.municipios IS 'Municípios são dados de referência pública para seleção de localidade';