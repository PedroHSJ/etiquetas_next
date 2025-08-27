-- Corrigir políticas RLS que causam recursão infinita

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Gestores podem criar convites para sua organização" ON convites;
DROP POLICY IF EXISTS "Gestores podem atualizar convites de sua organização" ON convites;
DROP POLICY IF EXISTS "Gestores podem ver usuários de sua organização" ON usuarios_organizacoes;
DROP POLICY IF EXISTS "Gestores podem atualizar usuários de sua organização" ON usuarios_organizacoes;

-- Criar políticas mais simples para convites
-- Permitir que qualquer usuário autenticado crie convites (será validado na aplicação)
CREATE POLICY "Usuários autenticados podem criar convites" ON convites
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que qualquer usuário autenticado atualize convites (será validado na aplicação)
CREATE POLICY "Usuários autenticados podem atualizar convites" ON convites
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Simplificar políticas para usuarios_organizacoes
-- Permitir que usuários vejam registros onde são gestores (usando organizacao owner)
CREATE POLICY "Gestores podem ver usuários de suas organizações" ON usuarios_organizacoes
  FOR SELECT USING (
    -- Usuário pode ver seus próprios registros
    usuario_id = auth.uid()
    OR
    -- Ou se for gestor da organização (verificando na tabela organizacoes)
    EXISTS (
      SELECT 1 FROM organizacoes o
      WHERE o.id = usuarios_organizacoes.organizacao_id
      AND o.user_id = auth.uid()
    )
  );

-- Permitir que gestores atualizem usuários de suas organizações
CREATE POLICY "Gestores podem atualizar usuários de suas organizações" ON usuarios_organizacoes
  FOR UPDATE USING (
    -- Verificar se o usuário atual é o dono da organização
    EXISTS (
      SELECT 1 FROM organizacoes o
      WHERE o.id = usuarios_organizacoes.organizacao_id
      AND o.user_id = auth.uid()
    )
  );

-- Política mais específica para convites baseada no dono da organização
DROP POLICY IF EXISTS "Usuários autenticados podem criar convites" ON convites;
CREATE POLICY "Donos de organização podem criar convites" ON convites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizacoes o
      WHERE o.id = convites.organizacao_id
      AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Usuários autenticados podem atualizar convites" ON convites;
CREATE POLICY "Donos de organização podem atualizar convites" ON convites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organizacoes o
      WHERE o.id = convites.organizacao_id
      AND o.user_id = auth.uid()
    )
  );
