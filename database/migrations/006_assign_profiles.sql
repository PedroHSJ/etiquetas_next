-- Atribuir perfis aos usuários existentes
-- Esta migração atribui perfis baseado no tipo de usuário

-- Atribuir perfil master aos usuários que criaram organizações (gestores)
INSERT INTO usuarios_perfis (usuario_organizacao_id, perfil_usuario_id, ativo, data_inicio)
SELECT 
  uo.id,
  p.id,
  true,
  NOW()
FROM usuarios_organizacoes uo
CROSS JOIN perfis_usuario p
WHERE p.nome = 'master'
  AND uo.ativo = true
  AND uo.perfil = 'gestor'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_perfis up 
    WHERE up.usuario_organizacao_id = uo.id 
    AND up.perfil_usuario_id = p.id
  );

-- Atribuir perfil gestor aos usuários que são gestores mas não criaram a organização
INSERT INTO usuarios_perfis (usuario_organizacao_id, perfil_usuario_id, ativo, data_inicio)
SELECT 
  uo.id,
  p.id,
  true,
  NOW()
FROM usuarios_organizacoes uo
CROSS JOIN perfis_usuario p
WHERE p.nome = 'gestor'
  AND uo.ativo = true
  AND uo.perfil = 'gestor'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_perfis up 
    WHERE up.usuario_organizacao_id = uo.id 
    AND up.perfil_usuario_id = p.id
  );

-- Atribuir perfil cozinheiro aos usuários que são cozinheiros
INSERT INTO usuarios_perfis (usuario_organizacao_id, perfil_usuario_id, ativo, data_inicio)
SELECT 
  uo.id,
  p.id,
  true,
  NOW()
FROM usuarios_organizacoes uo
CROSS JOIN perfis_usuario p
WHERE p.nome = 'cozinheiro'
  AND uo.ativo = true
  AND uo.perfil = 'cozinheiro'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_perfis up 
    WHERE up.usuario_organizacao_id = uo.id 
    AND up.perfil_usuario_id = p.id
  );

-- Atribuir perfil estoquista aos usuários que são estoquistas
INSERT INTO usuarios_perfis (usuario_organizacao_id, perfil_usuario_id, ativo, data_inicio)
SELECT 
  uo.id,
  p.id,
  true,
  NOW()
FROM usuarios_organizacoes uo
CROSS JOIN perfis_usuario p
WHERE p.nome = 'estoquista'
  AND uo.ativo = true
  AND uo.perfil = 'estoquista'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_perfis up 
    WHERE up.usuario_organizacao_id = uo.id 
    AND up.perfil_usuario_id = p.id
  );

-- Atribuir perfil funcionario aos usuários que são funcionários básicos
INSERT INTO usuarios_perfis (usuario_organizacao_id, perfil_usuario_id, ativo, data_inicio)
SELECT 
  uo.id,
  p.id,
  true,
  NOW()
FROM usuarios_organizacoes uo
CROSS JOIN perfis_usuario p
WHERE p.nome = 'funcionario'
  AND uo.ativo = true
  AND uo.perfil = 'funcionario'
  AND NOT EXISTS (
    SELECT 1 FROM usuarios_perfis up 
    WHERE up.usuario_organizacao_id = uo.id 
    AND up.perfil_usuario_id = p.id
  );
