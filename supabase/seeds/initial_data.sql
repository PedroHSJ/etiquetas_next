BEGIN;

-- ===== PERFIS DE USUÁRIO =====
INSERT INTO "public"."perfis" ("nome", "descricao", "ativo") 
VALUES 
('Estoquista', 'Acesso de estoque', true), 
('Gestor', 'Acesso de gerenciamento', true), 
('Cozinheiro', 'Acesso de cozinha', true);

-- ===== FUNCIONALIDADES =====
INSERT INTO "public"."funcionalidades" ("nome", "descricao", "rota", "ativo") 
VALUES 
('Membros', 'Gerenciamento de membros da organização', '/members', true), 
('Dashboard Cozinheiro', 'Visualização do painel principal', '/dashboard', true), 
('Convites', 'Gerenciamento de convites', '/convites', true), 
('Dashboard Estoquista', 'Visualização do painel principal', '/dashboard', true), 
('Etiquetas', 'Geração e impressão de etiquetas', '/etiquetas', true), 
('Departamentos', 'Gerenciamento de departamentos', '/departments', true), 
('Dashboard Gestor', 'Visualização do painel principal', '/dashboard', true), 
('Organizações', 'Gerenciamento de organizações', '/organizations', true);

-- ===== PERMISSÕES =====
INSERT INTO "public"."permissoes" ("funcionalidade_id", "perfil_usuario_id", "acao", "ativo") 
VALUES 
-- Estoquista
((SELECT id FROM funcionalidades WHERE nome = 'Etiquetas'), (SELECT id FROM perfis WHERE nome = 'Estoquista'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Dashboard Estoquista'), (SELECT id FROM perfis WHERE nome = 'Estoquista'), 'liberado', true),

-- Cozinheiro
((SELECT id FROM funcionalidades WHERE nome = 'Dashboard Cozinheiro'), (SELECT id FROM perfis WHERE nome = 'Cozinheiro'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Etiquetas'), (SELECT id FROM perfis WHERE nome = 'Cozinheiro'), 'liberado', true),

-- Gestor - Acesso completo
((SELECT id FROM funcionalidades WHERE nome = 'Dashboard Gestor'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Etiquetas'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Convites'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Organizações'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Departamentos'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'liberado', true),
((SELECT id FROM funcionalidades WHERE nome = 'Membros'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'liberado', true),
-- Permissões de visualização para Gestor
((SELECT id FROM funcionalidades WHERE nome = 'Convites'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'visualizar', true),
((SELECT id FROM funcionalidades WHERE nome = 'Organizações'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'visualizar', true),
((SELECT id FROM funcionalidades WHERE nome = 'Departamentos'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'visualizar', true),
((SELECT id FROM funcionalidades WHERE nome = 'Membros'), (SELECT id FROM perfis WHERE nome = 'Gestor'), 'visualizar', true);

-- ===== GRUPOS DE PRODUTOS =====
INSERT INTO grupos (id, nome) VALUES 
(1, 'Cereais e derivados'),
(2, 'Verduras, hortaliças e derivados'),
(3, 'Frutos e derivados'),
(4, 'Gorduras e óleos'),
(5, 'Pescados e frutos do mar'),
(6, 'Carnes e derivados'),
(7, 'Leite e derivados'),
(8, 'Ovos e derivados'),
(9, 'Produtos açucarados'),
(10, 'Miscelâneas'),
(11, 'Outros alimentos industrializados'),
(12, 'Alimentos preparados'),
(13, 'Leguminosas e derivados'),
(14, 'Nozes e sementes'),
(15, 'Frutas e derivados'),
(16, 'Bebidas (alcoólicas e não alcoólicas)');

-- ===== PRODUTOS =====
INSERT INTO produtos (id, nome, grupo_id) VALUES 
-- Cereais e derivados
(1, 'Arroz branco', 1),
(2, 'Arroz integral', 1),
(3, 'Farinha de trigo', 1),
(4, 'Macarrão', 1),
(5, 'Pão francês', 1),
(6, 'Aveia', 1),

-- Verduras, hortaliças e derivados
(7, 'Alface', 2),
(8, 'Tomate', 2),
(9, 'Cenoura', 2),
(10, 'Cebola', 2),
(11, 'Batata', 2),
(12, 'Brócolis', 2),

-- Carnes e derivados
(13, 'Frango', 6),
(14, 'Carne bovina', 6),
(15, 'Carne suína', 6),
(16, 'Linguiça', 6),

-- Leite e derivados
(17, 'Leite integral', 7),
(18, 'Iogurte natural', 7),
(19, 'Queijo muçarela', 7),
(20, 'Manteiga', 7),

-- Frutas e derivados
(21, 'Banana', 15),
(22, 'Maçã', 15),
(23, 'Laranja', 15),
(24, 'Mamão', 15),

-- Leguminosas e derivados
(25, 'Feijão preto', 13),
(26, 'Feijão carioca', 13),
(27, 'Lentilha', 13),
(28, 'Grão-de-bico', 13),

-- Gorduras e óleos
(29, 'Óleo de soja', 4),
(30, 'Azeite de oliva', 4),
(31, 'Margarina', 4),

-- Pescados e frutos do mar
(32, 'Salmão', 5),
(33, 'Tilápia', 5),
(34, 'Camarão', 5),

-- Ovos e derivados
(35, 'Ovo de galinha', 8),

-- Produtos açucarados
(36, 'Açúcar cristal', 9),
(37, 'Mel', 9),

-- Bebidas
(38, 'Água mineral', 16),
(39, 'Suco de laranja', 16),
(40, 'Café', 16),

-- Miscelâneas
(41, 'Sal refinado', 10),
(42, 'Pimenta-do-reino', 10),
(43, 'Açafrão', 10);

COMMIT;