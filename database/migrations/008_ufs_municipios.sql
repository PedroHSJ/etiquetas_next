-- =====================================================
-- MIGRAÇÃO 008: TABELAS DE UF E MUNICÍPIO
-- =====================================================
-- Cria tabelas estruturadas para Estados (UF) e Municípios
-- com integração para API ViaCEP
-- =====================================================

-- =====================================================
-- 1. TABELA DE ESTADOS (UF)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.estados (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(2) UNIQUE NOT NULL, -- Código UF (SP, RJ, etc.)
    nome VARCHAR(100) NOT NULL,
    regiao VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE MUNICÍPIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.municipios (
    id SERIAL PRIMARY KEY,
    estado_id INTEGER NOT NULL REFERENCES public.estados(id),
    codigo_ibge VARCHAR(10) UNIQUE, -- Código IBGE se disponível
    nome VARCHAR(150) NOT NULL,
    cep_inicial VARCHAR(8), -- CEP inicial da cidade (sem hífen)
    cep_final VARCHAR(8),   -- CEP final da cidade (sem hífen)
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ALTERAÇÕES NA TABELA ORGANIZAÇÕES
-- =====================================================

-- Adicionar as colunas de chave estrangeira para localização normalizada
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS estado_id INTEGER REFERENCES public.estados(id);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES public.municipios(id);

-- Adicionar campos específicos de endereço (complementando a migração 007)
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS endereco VARCHAR(255);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS numero VARCHAR(20);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS complemento VARCHAR(100);

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_estados_codigo ON public.estados(codigo);
CREATE INDEX IF NOT EXISTS idx_municipios_estado ON public.municipios(estado_id);
CREATE INDEX IF NOT EXISTS idx_municipios_nome ON public.municipios(nome);
CREATE INDEX IF NOT EXISTS idx_municipios_codigo_ibge ON public.municipios(codigo_ibge);
CREATE INDEX IF NOT EXISTS idx_organizacoes_estado_id ON public.organizacoes(estado_id);
CREATE INDEX IF NOT EXISTS idx_organizacoes_municipio_id ON public.organizacoes(municipio_id);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_municipios_updated_at
    BEFORE UPDATE ON public.municipios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. INSERÇÃO DOS DADOS DOS ESTADOS
-- =====================================================

INSERT INTO public.estados (codigo, nome, regiao) VALUES
    ('AC', 'Acre', 'Norte'),
    ('AL', 'Alagoas', 'Nordeste'),
    ('AP', 'Amapá', 'Norte'),
    ('AM', 'Amazonas', 'Norte'),
    ('BA', 'Bahia', 'Nordeste'),
    ('CE', 'Ceará', 'Nordeste'),
    ('DF', 'Distrito Federal', 'Centro-Oeste'),
    ('ES', 'Espírito Santo', 'Sudeste'),
    ('GO', 'Goiás', 'Centro-Oeste'),
    ('MA', 'Maranhão', 'Nordeste'),
    ('MT', 'Mato Grosso', 'Centro-Oeste'),
    ('MS', 'Mato Grosso do Sul', 'Centro-Oeste'),
    ('MG', 'Minas Gerais', 'Sudeste'),
    ('PA', 'Pará', 'Norte'),
    ('PB', 'Paraíba', 'Nordeste'),
    ('PR', 'Paraná', 'Sul'),
    ('PE', 'Pernambuco', 'Nordeste'),
    ('PI', 'Piauí', 'Nordeste'),
    ('RJ', 'Rio de Janeiro', 'Sudeste'),
    ('RN', 'Rio Grande do Norte', 'Nordeste'),
    ('RS', 'Rio Grande do Sul', 'Sul'),
    ('RO', 'Rondônia', 'Norte'),
    ('RR', 'Roraima', 'Norte'),
    ('SC', 'Santa Catarina', 'Sul'),
    ('SP', 'São Paulo', 'Sudeste'),
    ('SE', 'Sergipe', 'Nordeste'),
    ('TO', 'Tocantins', 'Norte')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- 7. FUNÇÃO PARA BUSCAR OU CRIAR MUNICÍPIO
-- =====================================================

CREATE OR REPLACE FUNCTION public.buscar_ou_criar_municipio(
    p_nome VARCHAR(150),
    p_uf VARCHAR(2),
    p_codigo_ibge VARCHAR(10) DEFAULT NULL,
    p_cep VARCHAR(8) DEFAULT NULL,
    p_latitude DECIMAL(10,8) DEFAULT NULL,
    p_longitude DECIMAL(11,8) DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_estado_id INTEGER;
    v_municipio_id INTEGER;
BEGIN
    -- Buscar o estado
    SELECT id INTO v_estado_id
    FROM public.estados
    WHERE codigo = p_uf;
    
    IF v_estado_id IS NULL THEN
        RAISE EXCEPTION 'Estado não encontrado: %', p_uf;
    END IF;
    
    -- Verificar se o município já existe
    SELECT id INTO v_municipio_id
    FROM public.municipios
    WHERE estado_id = v_estado_id 
    AND nome = p_nome;
    
    -- Se não existe, criar
    IF v_municipio_id IS NULL THEN
        INSERT INTO public.municipios (
            estado_id, 
            nome, 
            codigo_ibge, 
            cep_inicial,
            latitude,
            longitude
        )
        VALUES (
            v_estado_id, 
            p_nome, 
            p_codigo_ibge, 
            p_cep,
            p_latitude,
            p_longitude
        )
        RETURNING id INTO v_municipio_id;
    ELSE
        -- Atualizar dados se necessário
        UPDATE public.municipios 
        SET 
            codigo_ibge = COALESCE(p_codigo_ibge, codigo_ibge),
            cep_inicial = COALESCE(p_cep, cep_inicial),
            latitude = COALESCE(p_latitude, latitude),
            longitude = COALESCE(p_longitude, longitude),
            updated_at = NOW()
        WHERE id = v_municipio_id;
    END IF;
    
    RETURN v_municipio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Tabelas de referência são de leitura pública
ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler estados e municípios
CREATE POLICY "Todos podem ler estados" ON public.estados
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Todos podem ler municípios" ON public.municipios
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Apenas funções do sistema podem inserir novos municípios
CREATE POLICY "Sistema pode inserir municípios" ON public.municipios
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE public.estados IS 'Estados brasileiros (UF) com informações de região';
COMMENT ON COLUMN public.estados.codigo IS 'Código UF de 2 caracteres (SP, RJ, MG, etc.)';
COMMENT ON COLUMN public.estados.regiao IS 'Região geográfica (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)';

COMMENT ON TABLE public.municipios IS 'Municípios brasileiros, criados dinamicamente via API ViaCEP';
COMMENT ON COLUMN public.municipios.codigo_ibge IS 'Código IBGE do município quando disponível';
COMMENT ON COLUMN public.municipios.cep_inicial IS 'CEP inicial da faixa do município (sem hífen)';
COMMENT ON COLUMN public.municipios.cep_final IS 'CEP final da faixa do município (sem hífen)';

COMMENT ON COLUMN public.organizacoes.estado_id IS 'Referência para o estado (FK para estados.id)';
COMMENT ON COLUMN public.organizacoes.municipio_id IS 'Referência para o município (FK para municipios.id)';
COMMENT ON COLUMN public.organizacoes.endereco IS 'Logradouro (rua, avenida) da organização';
COMMENT ON COLUMN public.organizacoes.numero IS 'Número do endereço da organização';
COMMENT ON COLUMN public.organizacoes.complemento IS 'Complemento do endereço (apto, sala, etc.)';

COMMENT ON FUNCTION public.buscar_ou_criar_municipio IS 'Função para buscar município existente ou criar novo com dados do ViaCEP';