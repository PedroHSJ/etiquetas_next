-- Sistema RBAC Simples e Funcional
-- Criado do zero para evitar problemas de relacionamento

-- 1. Tabela de funcionalidades
CREATE TABLE funcionalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  categoria VARCHAR NOT NULL,
  rota VARCHAR NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de perfis de usuário
CREATE TABLE perfis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  nivel_acesso INTEGER NOT NULL DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de permissões
CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionalidade_id UUID NOT NULL REFERENCES funcionalidades(id) ON DELETE CASCADE,
  perfil_usuario_id UUID NOT NULL REFERENCES perfis_usuario(id) ON DELETE CASCADE,
  acao VARCHAR NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(funcionalidade_id, perfil_usuario_id, acao)
);

-- 4. Tabela de usuários com perfis
CREATE TABLE usuarios_perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_organizacao_id UUID NOT NULL REFERENCES usuarios_organizacoes(id) ON DELETE CASCADE,
  perfil_usuario_id UUID NOT NULL REFERENCES perfis_usuario(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_organizacao_id, perfil_usuario_id)
);

-- Inserir funcionalidades básicas
INSERT INTO funcionalidades (nome, descricao, categoria, rota) VALUES
  ('dashboard', 'Visualizar dashboard principal', 'gestao', '/dashboard'),
  ('produtos', 'Gerenciar produtos da UAN', 'operacional', '/produtos'),
  ('etiquetas', 'Criar e imprimir etiquetas', 'operacional', '/etiquetas'),
  ('departamentos', 'Gerenciar setores/departamentos', 'gestao', '/departments'),
  ('organizacoes', 'Gerenciar organizações', 'gestao', '/organizations'),
  ('usuarios', 'Gerenciar usuários e convites', 'gestao', '/users'),
  ('relatorios', 'Visualizar relatórios e análises', 'relatorios', '/relatorios'),
  ('configuracoes', 'Configurações do sistema', 'gestao', '/configuracoes'),
  ('escalas', 'Gerenciar escalas de trabalho', 'operacional', '/escalas'),
  ('estoque', 'Controle de estoque', 'operacional', '/estoque'),
  ('nutricao', 'Gestão nutricional', 'operacional', '/nutricao'),
  ('higiene', 'Controle de higiene', 'operacional', '/higiene'),
  ('manutencao', 'Gestão de manutenção', 'operacional', '/manutencao'),
  ('atendimento', 'Gestão de atendimento', 'operacional', '/atendimento'),
  ('permissoes', 'Gerenciar permissões do sistema', 'gestao', '/configuracoes/permissoes');

-- Inserir perfis de usuário
INSERT INTO perfis_usuario (nome, descricao, nivel_acesso) VALUES
  ('master', 'Usuário master com acesso total ao sistema', 4),
  ('gestor', 'Gestor com acesso completo à UAN', 3),
  ('cozinheiro', 'Cozinheiro com acesso operacional', 2),
  ('estoquista', 'Estoquista com acesso operacional', 2),
  ('funcionario', 'Funcionário com acesso básico', 1);

-- Inserir permissões para perfil master (acesso total)
INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'master';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'criar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'master';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'editar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'master';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'excluir'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'master';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'gerenciar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'master';

-- Inserir permissões para perfil gestor
INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'gestor';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'criar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'gestor' AND f.categoria IN ('operacional', 'gestao');

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'editar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'gestor' AND f.categoria IN ('operacional', 'gestao');

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'excluir'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'gestor' AND f.categoria IN ('operacional', 'gestao');

-- Inserir permissões para perfil cozinheiro
INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'cozinheiro';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'criar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'cozinheiro' AND f.nome IN ('produtos', 'etiquetas', 'escalas', 'estoque');

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'editar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'cozinheiro' AND f.nome IN ('produtos', 'etiquetas', 'escalas', 'estoque');

-- Inserir permissões para perfil estoquista
INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'estoquista';

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'criar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'estoquista' AND f.nome IN ('produtos', 'etiquetas', 'estoque');

INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'editar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'estoquista' AND f.nome IN ('produtos', 'etiquetas', 'estoque');

-- Inserir permissões para perfil funcionario
INSERT INTO permissoes (funcionalidade_id, perfil_usuario_id, acao)
SELECT f.id, p.id, 'visualizar'
FROM funcionalidades f, perfis_usuario p
WHERE p.nome = 'funcionario' AND f.nome IN ('dashboard', 'escalas');

-- Criar índices para performance
CREATE INDEX idx_funcionalidades_categoria ON funcionalidades(categoria);
CREATE INDEX idx_permissoes_funcionalidade ON permissoes(funcionalidade_id);
CREATE INDEX idx_permissoes_perfil ON permissoes(perfil_usuario_id);
CREATE INDEX idx_usuarios_perfis_usuario ON usuarios_perfis(usuario_organizacao_id);

-- Habilitar RLS
ALTER TABLE funcionalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_perfis ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança simples
CREATE POLICY "Usuários autenticados podem ver funcionalidades" ON funcionalidades
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem ver perfis de usuário" ON perfis_usuario
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem ver permissões" ON permissoes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem ver seus próprios perfis" ON usuarios_perfis
  FOR SELECT USING (
    usuario_organizacao_id IN (
      SELECT id FROM usuarios_organizacoes WHERE usuario_id = auth.uid()
    )
  );

-- Políticas para usuários master
CREATE POLICY "Apenas usuários master podem gerenciar funcionalidades" ON funcionalidades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis up
      JOIN perfis_usuario p ON up.perfil_usuario_id = p.id
      WHERE up.usuario_organizacao_id IN (
        SELECT id FROM usuarios_organizacoes WHERE usuario_id = auth.uid()
      )
      AND p.nome = 'master'
      AND up.ativo = true
    )
  );

CREATE POLICY "Apenas usuários master podem gerenciar perfis de usuário" ON perfis_usuario
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis up
      JOIN perfis_usuario p ON up.perfil_usuario_id = p.id
      WHERE up.usuario_organizacao_id IN (
        SELECT id FROM usuarios_organizacoes WHERE usuario_id = auth.uid()
      )
      AND p.nome = 'master'
      AND up.ativo = true
    )
  );

CREATE POLICY "Apenas usuários master podem gerenciar permissões" ON permissoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis up
      JOIN perfis_usuario p ON up.perfil_usuario_id = p.id
      WHERE up.usuario_organizacao_id IN (
        SELECT id FROM usuarios_organizacoes WHERE usuario_id = auth.uid()
      )
      AND p.nome = 'master'
      AND up.ativo = true
    )
  );

CREATE POLICY "Apenas usuários master podem gerenciar usuarios_perfis" ON usuarios_perfis
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios_perfis up
      JOIN perfis_usuario p ON up.perfil_usuario_id = p.id
      WHERE up.usuario_organizacao_id IN (
        SELECT id FROM usuarios_organizacoes WHERE usuario_id = auth.uid()
      )
      AND p.nome = 'master'
      AND up.ativo = true
    )
  );
