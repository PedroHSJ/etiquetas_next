-- =====================================================
-- SISTEMA DE ETIQUETAS - BANCO DE DADOS CONSOLIDADO
-- =====================================================
-- Este arquivo contém toda a estrutura necessária para
-- recriar o banco de dados do zero
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SEQUÊNCIAS
-- =====================================================

-- Sequência para IDs de etiquetas
CREATE SEQUENCE IF NOT EXISTS public.etiquetas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de organizações
CREATE TABLE IF NOT EXISTS public.organizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de departamentos
CREATE TABLE IF NOT EXISTS public.departamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id) ON DELETE CASCADE,
    tipo_departamento VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de grupos de produtos
CREATE TABLE IF NOT EXISTS public.grupos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS public.produtos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    grupo_id INTEGER REFERENCES public.grupos(id)
);

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.perfis_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de funcionalidades do sistema
CREATE TABLE IF NOT EXISTS public.funcionalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    rota VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcionalidade_id UUID NOT NULL REFERENCES public.funcionalidades(id),
    perfil_usuario_id UUID NOT NULL REFERENCES public.perfis_usuario(id),
    acao VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuários-organizações
CREATE TABLE IF NOT EXISTS public.usuarios_organizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id),
    perfil_id UUID NOT NULL REFERENCES public.perfis_usuario(id),
    ativo BOOLEAN DEFAULT true,
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_saida TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuários-perfis
CREATE TABLE IF NOT EXISTS public.usuarios_perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_organizacao_id UUID NOT NULL REFERENCES public.usuarios_organizacoes(id),
    perfil_usuario_id UUID NOT NULL REFERENCES public.perfis_usuario(id),
    ativo BOOLEAN DEFAULT true,
    data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de convites
CREATE TABLE IF NOT EXISTS public.convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    organizacao_id UUID NOT NULL REFERENCES public.organizacoes(id),
    perfil_id UUID NOT NULL REFERENCES public.perfis_usuario(id),
    status VARCHAR(50) DEFAULT 'pendente',
    token_invite VARCHAR(255) UNIQUE NOT NULL,
    expira_em TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    convidado_por UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aceito_em TIMESTAMP WITH TIME ZONE,
    aceito_por UUID REFERENCES auth.users(id)
);

-- Tabela de etiquetas
CREATE TABLE IF NOT EXISTS public.etiquetas (
    id INTEGER PRIMARY KEY DEFAULT nextval('public.etiquetas_id_seq'),
    produto_id INTEGER REFERENCES public.produtos(id),
    grupo_id INTEGER REFERENCES public.grupos(id),
    quantidade INTEGER DEFAULT 1,
    data_impressao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_id UUID REFERENCES auth.users(id),
    organizacao_id UUID REFERENCES public.organizacoes(id),
    status VARCHAR(100) DEFAULT 'impresso',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_produtos_grupo ON public.produtos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos(nome);

-- Índices para etiquetas
CREATE INDEX IF NOT EXISTS idx_etiquetas_produto ON public.etiquetas(produto_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_grupo ON public.etiquetas(grupo_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_usuario ON public.etiquetas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_organizacao ON public.etiquetas(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_etiquetas_data_impressao ON public.etiquetas(data_impressao);

-- Índices para usuários-organizações
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacoes_usuario ON public.usuarios_organizacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacoes_organizacao ON public.usuarios_organizacoes(organizacao_id);

-- Índices para convites
CREATE INDEX IF NOT EXISTS idx_convites_email ON public.convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_token ON public.convites(token_invite);
CREATE INDEX IF NOT EXISTS idx_convites_status ON public.convites(status);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir perfis de usuário padrão
INSERT INTO public.perfis_usuario (id, nome, descricao) VALUES
    (gen_random_uuid(), 'Gestor', 'Acesso de gerenciamento'),
    (gen_random_uuid(), 'Estoquista', 'Acesso de estoque'),
    (gen_random_uuid(), 'Cozinheiro', 'Acesso de cozinha')
ON CONFLICT (nome) DO NOTHING;

-- Inserir funcionalidades do sistema
INSERT INTO public.funcionalidades (nome, descricao, rota) VALUES
    ('Dashboard Gestor', 'Visualização do painel principal', '/dashboard'),
    ('Dashboard Estoquista', 'Visualização do painel principal', '/dashboard'),
    ('Dashboard Cozinheiro', 'Visualização do painel principal', '/dashboard'),
    ('Organizações', 'Gerenciamento de organizações', '/organizations'),
    ('Departamentos', 'Gerenciamento de departamentos', '/departments'),
    ('Etiquetas', 'Geração e impressão de etiquetas', '/etiquetas'),
    ('Convites', 'Gerenciamento de convites', '/invites')
ON CONFLICT (nome) DO NOTHING;

-- Inserir permissões para Gestor
INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Dashboard Gestor' AND p.nome = 'Gestor';

INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Organizações' AND p.nome = 'Gestor';

INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Departamentos' AND p.nome = 'Gestor';

INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Etiquetas' AND p.nome = 'Gestor';

INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Convites' AND p.nome = 'Gestor';

-- Inserir permissões para Estoquista (apenas Dashboard e Etiquetas)
INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Dashboard Estoquista' AND p.nome = 'Estoquista';

INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Etiquetas' AND p.nome = 'Estoquista';

-- Inserir permissões para Cozinheiro (apenas Dashboard e Etiquetas)
INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Dashboard Cozinheiro' AND p.nome = 'Cozinheiro';

INSERT INTO public.permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM public.funcionalidades f, public.perfis_usuario p
WHERE f.nome = 'Etiquetas' AND p.nome = 'Cozinheiro';

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE public.organizacoes IS 'Tabela de organizações/empresas que usam o sistema';
COMMENT ON TABLE public.departamentos IS 'Departamentos dentro de cada organização';
COMMENT ON TABLE public.grupos IS 'Grupos de classificação dos produtos';
COMMENT ON TABLE public.produtos IS 'Produtos cadastrados no sistema';
COMMENT ON TABLE public.perfis_usuario IS 'Perfis de acesso dos usuários';
COMMENT ON TABLE public.funcionalidades IS 'Funcionalidades disponíveis no sistema';
COMMENT ON TABLE public.permissoes IS 'Permissões de acesso por perfil';
COMMENT ON TABLE public.usuarios_organizacoes IS 'Relacionamento entre usuários e organizações';
COMMENT ON TABLE public.usuarios_perfis IS 'Relacionamento entre usuários e perfis';
COMMENT ON TABLE public.convites IS 'Convites para novos usuários';
COMMENT ON TABLE public.etiquetas IS 'Etiquetas geradas pelo sistema';

-- =====================================================
-- FIM DO ARQUIVO
-- =====================================================
