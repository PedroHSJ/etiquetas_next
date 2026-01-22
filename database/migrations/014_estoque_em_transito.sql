-- =====================================================
-- MIGRAÇÃO 014: ESTOQUE EM TRÂNSITO
-- =====================================================
-- Adiciona tabela para controle de alimentos fracionados
-- e etiquetados para uso posterior.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.estoque_em_transito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id INTEGER NOT NULL REFERENCES public.produtos(id),
    quantidade NUMERIC(15,3) NOT NULL,
    unidade_medida_code VARCHAR(10) NOT NULL,
    data_fabricacao TIMESTAMP WITH TIME ZONE,
    data_validade TIMESTAMP WITH TIME ZONE,
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_estoque_transito_produto ON public.estoque_em_transito(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_transito_organizacao ON public.estoque_em_transito(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_estoque_transito_usuario ON public.estoque_em_transito(usuario_id);

-- ETIQUETAS RELACIONADAS AO ESTOQUE EM TRÂNSITO
-- Adiciona coluna para vincular uma etiqueta ao estoque em trânsito se necessário
ALTER TABLE public.etiquetas ADD COLUMN IF NOT EXISTS estoque_transito_id UUID REFERENCES public.estoque_em_transito(id) ON DELETE SET NULL;

-- RLS (ROW LEVEL SECURITY)
ALTER TABLE public.estoque_em_transito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver estoque em transito de suas organizações" ON public.estoque_em_transito
    FOR SELECT USING (
        organizacao_id IN (
            SELECT o.organizacao_id 
            FROM public.usuarios_organizacoes o
            WHERE o.usuario_id = auth.uid() AND o.ativo = true
        )
    );

CREATE POLICY "Usuários podem inserir estoque em transito em suas organizações" ON public.estoque_em_transito
    FOR INSERT WITH CHECK (
        organizacao_id IN (
            SELECT o.organizacao_id 
            FROM public.usuarios_organizacoes o
            WHERE o.usuario_id = auth.uid() AND o.ativo = true
        )
    );

CREATE POLICY "Usuários podem atualizar estoque em transito de suas organizações" ON public.estoque_em_transito
    FOR UPDATE USING (
        organizacao_id IN (
            SELECT o.organizacao_id 
            FROM public.usuarios_organizacoes o
            WHERE o.usuario_id = auth.uid() AND o.ativo = true
        )
    );

CREATE POLICY "Usuários podem deletar estoque em transito de suas organizações" ON public.estoque_em_transito
    FOR DELETE USING (
        organizacao_id IN (
            SELECT o.organizacao_id 
            FROM public.usuarios_organizacoes o
            WHERE o.usuario_id = auth.uid() AND o.ativo = true
        )
    );

-- TRIGGER PARA UPDATED_AT
DROP TRIGGER IF EXISTS update_estoque_em_transito_updated_at ON public.estoque_em_transito;
CREATE TRIGGER update_estoque_em_transito_updated_at
    BEFORE UPDATE ON public.estoque_em_transito
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- COMENTÁRIOS
COMMENT ON TABLE public.estoque_em_transito IS 'Alimentos retirados do estoque, etiquetados e guardados para uso posterior';
COMMENT ON COLUMN public.estoque_em_transito.quantidade IS 'Quantidade fracionada do alimento';
COMMENT ON COLUMN public.estoque_em_transito.data_fabricacao IS 'Data de fabricação/abertura do produto';
COMMENT ON COLUMN public.estoque_em_transito.data_validade IS 'Nova data de validade após abertura';
