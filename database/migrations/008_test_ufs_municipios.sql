-- Script para testar a migração 008_ufs_municipios.sql
-- Execute este arquivo após aplicar a migração principal

-- 1. Verificar se as tabelas foram criadas
SELECT 'Tabela estados' as tabela, count(*) as total_registros FROM estados
UNION ALL
SELECT 'Tabela municipios' as tabela, count(*) as total_registros FROM municipios;

-- 2. Listar alguns estados criados
SELECT id, codigo, nome, regiao FROM estados LIMIT 5;

-- 3. Testar a função de buscar/criar município
-- Exemplo com uma cidade real (São Paulo - SP)
SELECT buscar_ou_criar_municipio('São Paulo', 'SP', '3550308', '01000000');

-- Verificar se o município foi criado
SELECT m.id, m.nome, e.codigo, e.nome as estado_nome 
FROM municipios m
JOIN estados e ON m.estado_id = e.id
WHERE m.nome = 'São Paulo' AND e.codigo = 'SP';

-- 4. Testar com outro município (Rio de Janeiro - RJ)  
SELECT buscar_ou_criar_municipio('Rio de Janeiro', 'RJ', '3304557', '20000000');

-- 5. Listar os municípios criados
SELECT m.id, m.nome, m.codigo_ibge, e.codigo as uf, m.created_at
FROM municipios m
JOIN estados e ON m.estado_id = e.id
ORDER BY m.created_at DESC
LIMIT 10;

-- 6. Testar busca de município existente (deve retornar o mesmo)
SELECT buscar_ou_criar_municipio('São Paulo', 'SP', '3550308', '01000001');

-- Deve retornar o mesmo ID do primeiro teste
SELECT m.id, m.nome, e.codigo, m.codigo_ibge
FROM municipios m
JOIN estados e ON m.estado_id = e.id
WHERE m.nome = 'São Paulo' AND e.codigo = 'SP';

-- 7. Verificar as políticas RLS (devem estar ativas)
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE tablename IN ('estados', 'municipios')
AND schemaname = 'public';

-- 8. Verificar as políticas criadas
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename IN ('estados', 'municipios')
ORDER BY tablename, policyname;

-- 9. Testar consulta como usuário autenticado (simula RLS)
-- Verificar se conseguimos acessar os dados
SELECT e.nome as estado, count(m.id) as total_municipios
FROM estados e
LEFT JOIN municipios m ON e.id = m.estado_id
GROUP BY e.id, e.nome
HAVING count(m.id) > 0
ORDER BY e.nome;

-- 10. Mostrar a estrutura das tabelas
\d+ estados;
\d+ municipios;