-- =====================================================
-- MIGRAÇÃO 007: EXPANSÃO DE DADOS DA UAN
-- =====================================================
-- Adiciona informações completas para o cadastro de UAN
-- (Unidade de Alimentação e Nutrição)
-- =====================================================

-- =====================================================
-- 1. ALTERAÇÕES NA TABELA ORGANIZACOES
-- =====================================================

-- Informações Básicas
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14) UNIQUE;
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS tipo_uan VARCHAR(50) CHECK (tipo_uan IN ('comercial', 'institucional', 'hospital', 'escola', 'empresa', 'outro'));
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS capacidade_atendimento INTEGER;
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS data_inauguracao DATE;

-- Localização e Contato
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS endereco_completo TEXT;
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS cep VARCHAR(9);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS bairro VARCHAR(100);
-- REMOVIDO: cidade e estado varchar - serão substituídos por FK na migração 008
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS telefone_principal VARCHAR(15);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS telefone_alternativo VARCHAR(15);
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS email_institucional VARCHAR(255);

-- Campo updated_at se não existir
ALTER TABLE public.organizacoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 2. NOVA TABELA: RESPONSÁVEIS TÉCNICOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.responsaveis_tecnicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    tipo_responsavel VARCHAR(50) NOT NULL CHECK (tipo_responsavel IN ('nutricionista', 'gestor', 'seguranca_alimentar', 'outro')),
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(20), -- CRN para nutricionistas, CPF, etc.
    telefone VARCHAR(15),
    email VARCHAR(255),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. NOVA TABELA: HORÁRIOS DE FUNCIONAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.horarios_funcionamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 1=segunda, etc.
    tipo_refeicao VARCHAR(50) NOT NULL CHECK (tipo_refeicao IN ('cafe', 'almoco', 'jantar', 'lanche_manha', 'lanche_tarde', 'ceia')),
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para organizações
CREATE INDEX IF NOT EXISTS idx_organizacoes_cnpj ON public.organizacoes(cnpj);
CREATE INDEX IF NOT EXISTS idx_organizacoes_tipo_uan ON public.organizacoes(tipo_uan);
-- REMOVIDO: índices para cidade e estado varchar

-- Índices para responsáveis técnicos
CREATE INDEX IF NOT EXISTS idx_responsaveis_organizacao ON public.responsaveis_tecnicos(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_responsaveis_tipo ON public.responsaveis_tecnicos(tipo_responsavel);
CREATE INDEX IF NOT EXISTS idx_responsaveis_ativo ON public.responsaveis_tecnicos(ativo);

-- Índices para horários de funcionamento
CREATE INDEX IF NOT EXISTS idx_horarios_organizacao ON public.horarios_funcionamento(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_horarios_dia ON public.horarios_funcionamento(dia_semana);
CREATE INDEX IF NOT EXISTS idx_horarios_tipo_refeicao ON public.horarios_funcionamento(tipo_refeicao);
CREATE INDEX IF NOT EXISTS idx_horarios_ativo ON public.horarios_funcionamento(ativo);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Trigger para organizações (se não existir)
DROP TRIGGER IF EXISTS update_organizacoes_updated_at ON public.organizacoes;
CREATE TRIGGER update_organizacoes_updated_at
    BEFORE UPDATE ON public.organizacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para responsáveis técnicos
DROP TRIGGER IF EXISTS update_responsaveis_tecnicos_updated_at ON public.responsaveis_tecnicos;
CREATE TRIGGER update_responsaveis_tecnicos_updated_at
    BEFORE UPDATE ON public.responsaveis_tecnicos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para horários de funcionamento
DROP TRIGGER IF EXISTS update_horarios_funcionamento_updated_at ON public.horarios_funcionamento;
CREATE TRIGGER update_horarios_funcionamento_updated_at
    BEFORE UPDATE ON public.horarios_funcionamento
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Ativar RLS nas novas tabelas
ALTER TABLE public.responsaveis_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_funcionamento ENABLE ROW LEVEL SECURITY;

-- Políticas para responsáveis técnicos
CREATE POLICY "Usuários podem ver responsáveis de suas organizações" ON public.responsaveis_tecnicos
    FOR SELECT USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "Usuários podem inserir responsáveis em suas organizações" ON public.responsaveis_tecnicos
    FOR INSERT WITH CHECK (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "Usuários podem atualizar responsáveis de suas organizações" ON public.responsaveis_tecnicos
    FOR UPDATE USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "Usuários podem deletar responsáveis de suas organizações" ON public.responsaveis_tecnicos
    FOR DELETE USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

-- Políticas para horários de funcionamento
CREATE POLICY "Usuários podem ver horários de suas organizações" ON public.horarios_funcionamento
    FOR SELECT USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "Usuários podem inserir horários em suas organizações" ON public.horarios_funcionamento
    FOR INSERT WITH CHECK (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "Usuários podem atualizar horários de suas organizações" ON public.horarios_funcionamento
    FOR UPDATE USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

CREATE POLICY "Usuários podem deletar horários de suas organizações" ON public.horarios_funcionamento
    FOR DELETE USING (
        organizacao_id IN (
            SELECT organizacao_id 
            FROM public.usuarios_organizacoes 
            WHERE usuario_id = auth.uid() AND ativo = true
        )
    );

-- =====================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN public.organizacoes.cnpj IS 'CNPJ da organização (apenas números)';
COMMENT ON COLUMN public.organizacoes.tipo_uan IS 'Tipo da UAN: comercial, institucional, hospital, escola, empresa, outro';
COMMENT ON COLUMN public.organizacoes.capacidade_atendimento IS 'Número de refeições servidas por dia';
COMMENT ON COLUMN public.organizacoes.latitude IS 'Coordenada de latitude para localização GPS';
COMMENT ON COLUMN public.organizacoes.longitude IS 'Coordenada de longitude para localização GPS';

COMMENT ON TABLE public.responsaveis_tecnicos IS 'Responsáveis técnicos das UANs (nutricionistas, gestores, etc.)';
COMMENT ON COLUMN public.responsaveis_tecnicos.documento IS 'Documento profissional (CRN, CPF, etc.)';
COMMENT ON COLUMN public.responsaveis_tecnicos.tipo_responsavel IS 'Tipo: nutricionista, gestor, seguranca_alimentar, outro';

COMMENT ON TABLE public.horarios_funcionamento IS 'Horários de funcionamento detalhados por tipo de refeição';
COMMENT ON COLUMN public.horarios_funcionamento.dia_semana IS '0=domingo, 1=segunda-feira, ..., 6=sábado';
COMMENT ON COLUMN public.horarios_funcionamento.tipo_refeicao IS 'Tipo: cafe, almoco, jantar, lanche_manha, lanche_tarde, ceia';