BEGIN;

-- ===== USER PROFILES =====
INSERT INTO public.profiles (name, description, active) 
VALUES 
('Estoquista', 'Acesso de estoque', true), 
('Gestor', 'Acesso de gerenciamento', true), 
('Cozinheiro', 'Acesso de cozinha', true);

-- ===== FUNCTIONALITIES =====
INSERT INTO public.functionalities (name, description, code, active) 
VALUES 
-- Dashboard
('Dashboard Gestor', 'Visualização do painel do gestor', 'DASHBOARD:MANAGER', true),
('Dashboard Estoquista', 'Visualização do painel do estoquista', 'DASHBOARD:STOCK', true),
('Dashboard Cozinheiro', 'Visualização do painel do cozinheiro', 'DASHBOARD:KITCHEN', true),
-- Membros
('Membros - Visualizar', 'Visualização de membros da organização', 'MEMBERS:READ', true),
('Membros - Gerenciar', 'Gerenciamento de membros da organização', 'MEMBERS:WRITE', true),
-- Convites
('Convites - Visualizar', 'Visualização de convites', 'INVITES:READ', true),
('Convites - Gerenciar', 'Gerenciamento de convites', 'INVITES:WRITE', true),
-- Organizações
('Organizações - Visualizar', 'Visualização de organizações', 'ORGANIZATIONS:READ', true),
('Organizações - Gerenciar', 'Gerenciamento de organizações', 'ORGANIZATIONS:WRITE', true),
-- Departamentos
('Departamentos - Visualizar', 'Visualização de departamentos', 'DEPARTMENTS:READ', true),
('Departamentos - Gerenciar', 'Gerenciamento de departamentos', 'DEPARTMENTS:WRITE', true),
-- Etiquetas
('Etiquetas - Visualizar', 'Visualização de etiquetas', 'LABELS:READ', true),
('Etiquetas - Gerenciar', 'Geração e impressão de etiquetas', 'LABELS:WRITE', true),
-- Estoque
('Estoque - Visualizar', 'Visualização do estoque', 'STOCK:READ', true),
('Estoque - Gerenciar', 'Gerenciamento de estoque', 'STOCK:WRITE', true),
-- Fichas Técnicas
('Fichas Técnicas - Visualizar', 'Visualização de fichas técnicas', 'TECHNICAL_SHEETS:READ', true),
('Fichas Técnicas - Gerenciar', 'Gerenciamento de fichas técnicas', 'TECHNICAL_SHEETS:WRITE', true);

-- ===== PERMISSIONS =====
-- Usando o campo code para referenciar funcionalidades
INSERT INTO public.permissions (functionality_id, profile_id, action, active) 
VALUES 
-- Estoquista - Acesso apenas ao estoque
((SELECT id FROM public.functionalities WHERE code = 'STOCK:READ'), (SELECT id FROM public.profiles WHERE name = 'Estoquista'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'STOCK:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Estoquista'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'DASHBOARD:STOCK'), (SELECT id FROM public.profiles WHERE name = 'Estoquista'), 'granted', true),

-- Cozinheiro - Acesso apenas ao estoque
((SELECT id FROM public.functionalities WHERE code = 'STOCK:READ'), (SELECT id FROM public.profiles WHERE name = 'Cozinheiro'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'STOCK:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Cozinheiro'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'DASHBOARD:KITCHEN'), (SELECT id FROM public.profiles WHERE name = 'Cozinheiro'), 'granted', true),

-- Gestor - Acesso completo a todas as funcionalidades
((SELECT id FROM public.functionalities WHERE code = 'DASHBOARD:MANAGER'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'MEMBERS:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'MEMBERS:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'INVITES:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'INVITES:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'ORGANIZATIONS:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'ORGANIZATIONS:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'DEPARTMENTS:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'DEPARTMENTS:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'LABELS:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'LABELS:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'STOCK:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'STOCK:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'TECHNICAL_SHEETS:READ'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true),
((SELECT id FROM public.functionalities WHERE code = 'TECHNICAL_SHEETS:WRITE'), (SELECT id FROM public.profiles WHERE name = 'Gestor'), 'granted', true);

-- ===== PRODUCT GROUPS =====
INSERT INTO public.groups (id, name) VALUES 
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

-- ===== PRODUCTS =====
INSERT INTO public.products (id, name, group_id) VALUES 
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