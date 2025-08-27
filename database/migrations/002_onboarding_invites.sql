-- Tabela para perfis de usuário
CREATE TABLE IF NOT EXISTS perfis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL UNIQUE, -- 'gestor', 'cozinheiro', 'estoquista'
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir perfis padrão
INSERT INTO perfis_usuario (nome, descricao) VALUES
  ('gestor', 'Gestor da UAN com acesso completo ao sistema'),
  ('cozinheiro', 'Funcionário responsável pela produção de alimentos'),
  ('estoquista', 'Funcionário responsável pelo controle de estoque')
ON CONFLICT (nome) DO NOTHING;

-- Tabela para convites
CREATE TABLE IF NOT EXISTS convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfis_usuario(id),
  status VARCHAR NOT NULL DEFAULT 'pendente', -- 'pendente', 'aceito', 'expirado'
  token_invite VARCHAR NOT NULL UNIQUE, -- Token único para aceitar convite
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  convidado_por UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aceito_em TIMESTAMP WITH TIME ZONE,
  aceito_por UUID REFERENCES auth.users(id)
);

-- Tabela para relacionar usuários com organizações e seus perfis
CREATE TABLE IF NOT EXISTS usuarios_organizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organizacao_id UUID NOT NULL REFERENCES organizacoes(id) ON DELETE CASCADE,
  perfil_id UUID NOT NULL REFERENCES perfis_usuario(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_saida TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, organizacao_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_convites_email ON convites(email);
CREATE INDEX IF NOT EXISTS idx_convites_token ON convites(token_invite);
CREATE INDEX IF NOT EXISTS idx_convites_status ON convites(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_org_usuario ON usuarios_organizacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_org_organizacao ON usuarios_organizacoes(organizacao_id);

-- RLS (Row Level Security)
ALTER TABLE perfis_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE convites ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_organizacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis_usuario (leitura pública)
CREATE POLICY "Perfis são visíveis para todos" ON perfis_usuario
  FOR SELECT USING (true);

-- Políticas para convites
CREATE POLICY "Usuários podem ver convites para seu email" ON convites
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Gestores podem criar convites para sua organização" ON convites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_organizacoes uo
      JOIN perfis_usuario p ON uo.perfil_id = p.id
      WHERE uo.usuario_id = auth.uid()
      AND uo.organizacao_id = convites.organizacao_id
      AND p.nome = 'gestor'
      AND uo.ativo = true
    )
  );

CREATE POLICY "Gestores podem atualizar convites de sua organização" ON convites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios_organizacoes uo
      JOIN perfis_usuario p ON uo.perfil_id = p.id
      WHERE uo.usuario_id = auth.uid()
      AND uo.organizacao_id = convites.organizacao_id
      AND p.nome = 'gestor'
      AND uo.ativo = true
    )
  );

-- Políticas para usuarios_organizacoes
CREATE POLICY "Usuários podem ver suas próprias associações" ON usuarios_organizacoes
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Gestores podem ver usuários de sua organização" ON usuarios_organizacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios_organizacoes uo
      JOIN perfis_usuario p ON uo.perfil_id = p.id
      WHERE uo.usuario_id = auth.uid()
      AND uo.organizacao_id = usuarios_organizacoes.organizacao_id
      AND p.nome = 'gestor'
      AND uo.ativo = true
    )
  );

CREATE POLICY "Sistema pode inserir usuários em organizações" ON usuarios_organizacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Gestores podem atualizar usuários de sua organização" ON usuarios_organizacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios_organizacoes uo
      JOIN perfis_usuario p ON uo.perfil_id = p.id
      WHERE uo.usuario_id = auth.uid()
      AND uo.organizacao_id = usuarios_organizacoes.organizacao_id
      AND p.nome = 'gestor'
      AND uo.ativo = true
    )
  );
