-- Criação das tabelas para fichas técnicas
-- Tabela principal de fichas técnicas
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_prato VARCHAR(255) NOT NULL,
    numero_porcoes INTEGER NOT NULL DEFAULT 1,
    tempo_preparo VARCHAR(50),
    tempo_cozimento VARCHAR(50),
    dificuldade VARCHAR(20) CHECK (dificuldade IN ('fácil', 'médio', 'difícil')),
    etapas_preparo TEXT[],
    
    -- Informações nutricionais (JSONB para flexibilidade)
    informacoes_nutricionais JSONB DEFAULT '{}'::jsonb,
    
    -- Relacionamentos
    organizacao_id UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
    criado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices
    UNIQUE(nome_prato, organizacao_id)
);

-- Tabela de ingredientes das fichas técnicas
CREATE TABLE IF NOT EXISTS public.fichas_tecnicas_ingredientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ficha_tecnica_id UUID NOT NULL REFERENCES fichas_tecnicas(id) ON DELETE CASCADE,
    
    -- Dados do ingrediente
    nome_ingrediente VARCHAR(255) NOT NULL,
    quantidade VARCHAR(50) NOT NULL,
    unidade VARCHAR(50) NOT NULL,
    quantidade_original VARCHAR(50) NOT NULL, -- Para recálculos de proporção
    
    -- Relacionamento com produtos (opcional)
    produto_id INTEGER REFERENCES produtos(id) ON DELETE SET NULL,
    
    -- Ordem dos ingredientes na lista
    ordem INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários nas tabelas
COMMENT ON TABLE public.fichas_tecnicas IS 'Fichas técnicas de pratos/receitas das organizações';
COMMENT ON TABLE public.fichas_tecnicas_ingredientes IS 'Ingredientes das fichas técnicas com quantidades e relações com produtos';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_organizacao_id ON fichas_tecnicas(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_criado_por ON fichas_tecnicas(criado_por);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_nome_prato ON fichas_tecnicas(nome_prato);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_ingredientes_ficha_id ON fichas_tecnicas_ingredientes(ficha_tecnica_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_ingredientes_produto_id ON fichas_tecnicas_ingredientes(produto_id);
CREATE INDEX IF NOT EXISTS idx_fichas_tecnicas_ingredientes_ordem ON fichas_tecnicas_ingredientes(ficha_tecnica_id, ordem);

-- Função para atualizar o timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática de updated_at
CREATE TRIGGER update_fichas_tecnicas_updated_at 
    BEFORE UPDATE ON fichas_tecnicas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_tecnicas_ingredientes_updated_at 
    BEFORE UPDATE ON fichas_tecnicas_ingredientes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_tecnicas_ingredientes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para fichas_tecnicas
-- Usuários só podem ver fichas da sua organização
CREATE POLICY "Users can view technical sheets from their organization" ON fichas_tecnicas
    FOR SELECT USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

-- Usuários podem criar fichas para sua organização
CREATE POLICY "Users can create technical sheets for their organization" ON fichas_tecnicas
    FOR INSERT WITH CHECK (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
        AND criado_por = auth.uid()
    );

-- Usuários podem atualizar fichas que criaram
CREATE POLICY "Users can update their own technical sheets" ON fichas_tecnicas
    FOR UPDATE USING (
        criado_por = auth.uid()
        AND organizacao_id IN (
            SELECT organizacao_id 
            FROM usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

-- Usuários podem deletar fichas que criaram
CREATE POLICY "Users can delete their own technical sheets" ON fichas_tecnicas
    FOR DELETE USING (
        criado_por = auth.uid()
        AND organizacao_id IN (
            SELECT organizacao_id 
            FROM usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

-- Políticas RLS para fichas_tecnicas_ingredientes
-- Usuários podem ver ingredientes das fichas que têm acesso
CREATE POLICY "Users can view ingredients from accessible technical sheets" ON fichas_tecnicas_ingredientes
    FOR SELECT USING (
        ficha_tecnica_id IN (
            SELECT id FROM fichas_tecnicas 
            WHERE organizacao_id IN (
                SELECT organizacao_id 
                FROM usuarios_organizacoes 
                WHERE usuario_id = auth.uid() AND ativo = true
            )
        )
    );

-- Usuários podem inserir ingredientes em fichas que criaram
CREATE POLICY "Users can insert ingredients in their technical sheets" ON fichas_tecnicas_ingredientes
    FOR INSERT WITH CHECK (
        ficha_tecnica_id IN (
            SELECT id FROM fichas_tecnicas 
            WHERE criado_por = auth.uid()
            AND organizacao_id IN (
                SELECT organizacao_id 
                FROM usuarios_organizacoes 
                WHERE usuario_id = auth.uid() AND ativo = true
            )
        )
    );

-- Usuários podem atualizar ingredientes de fichas que criaram
CREATE POLICY "Users can update ingredients from their technical sheets" ON fichas_tecnicas_ingredientes
    FOR UPDATE USING (
        ficha_tecnica_id IN (
            SELECT id FROM fichas_tecnicas 
            WHERE criado_por = auth.uid()
            AND organizacao_id IN (
                SELECT organizacao_id 
                FROM usuarios_organizacoes 
                WHERE usuario_id = auth.uid() AND ativo = true
            )
        )
    );

-- Usuários podem deletar ingredientes de fichas que criaram
CREATE POLICY "Users can delete ingredients from their technical sheets" ON fichas_tecnicas_ingredientes
    FOR DELETE USING (
        ficha_tecnica_id IN (
            SELECT id FROM fichas_tecnicas 
            WHERE criado_por = auth.uid()
            AND organizacao_id IN (
                SELECT organizacao_id 
                FROM usuarios_organizacoes 
                WHERE usuario_id = auth.uid() AND ativo = true
            )
        )
    );