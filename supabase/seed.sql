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


INSERT INTO public.unit_of_measure (code, description) VALUES
    ('un', 'Unidade'),
    ('kg', 'Quilograma'),
    ('g',  'Grama'),
    ('l',  'Litro'),
    ('ml', 'Mililitro'),
    ('cx', 'Caixa'),
    ('pct', 'Pacote')
ON CONFLICT (code) DO NOTHING;

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
(16, 'Bebidas (alcoólicas e não alcoólicas)'),
(17, 'Conservas e Enlatados'),
(18, 'Congelados e Prontos'),
(19, 'Especiarias e Ervas'),
(20, 'Molhos e Condimentos');

-- ===== PRODUCTS =====
INSERT INTO public.products (id, name, group_id) VALUES 
(1, 'Arroz branco', 1),
(2, 'Arroz integral', 1),
(3, 'Farinha de trigo', 1),
(4, 'Macarrão', 1),
(5, 'Pão francês', 1),
(6, 'Aveia', 1),
(7, 'Alface', 2),
(8, 'Tomate', 2),
(9, 'Cenoura', 2),
(10, 'Cebola', 2),
(11, 'Batata', 2),
(12, 'Brócolis', 2),
(13, 'Frango', 6),
(14, 'Carne bovina', 6),
(15, 'Carne suína', 6),
(16, 'Linguiça', 6),
(17, 'Leite integral', 7),
(18, 'Iogurte natural', 7),
(19, 'Queijo muçarela', 7),
(20, 'Manteiga', 7),
(21, 'Banana', 15),
(22, 'Maçã', 15),
(23, 'Laranja', 15),
(24, 'Mamão', 15),
(25, 'Feijão preto', 13),
(26, 'Feijão carioca', 13),
(27, 'Lentilha', 13),
(28, 'Grão-de-bico', 13),
(29, 'Óleo de soja', 4),
(30, 'Azeite de oliva', 4),
(31, 'Margarina', 4),
(32, 'Salmão', 5),
(33, 'Tilápia', 5),
(34, 'Camarão', 5),
(35, 'Ovo de galinha', 8),
(36, 'Açúcar cristal', 9),
(37, 'Mel', 9),
(38, 'Água mineral', 16),
(39, 'Suco de laranja', 16),
(40, 'Café', 16),
(41, 'Sal refinado', 10),
(42, 'Pimenta-do-reino', 10),
(43, 'Açafrão', 10),
(44, 'Cacau em pó', 3),
(45, 'Chocolate meio amargo', 3),
(46, 'Gelatina em pó', 11),
(47, 'Amido de milho', 11),
(48, 'Massa pronta para bolo', 12),
(49, 'Torta salgada pronta', 12),
(50, 'Castanha de caju', 14),
(51, 'Nozes', 14),
(52, 'Gergelim', 14),
(53, 'Milho em conserva', 17),
(54, 'Ervilha em conserva', 17),
(55, 'Palmito pupunha', 17),
(56, 'Batatas pré-fritas', 18),
(57, 'Hambúrguer bovino', 18),
(58, 'Orégano', 19),
(59, 'Manjericão seco', 19),
(60, 'Canela em pó', 19),
(61, 'Maionese', 20),
(62, 'Ketchup', 20),
(63, 'Mostarda', 20),
(64, 'Cuscuz de milho', 1),
(65, 'Quinoa', 1),
(66, 'Refrigerante de cola', 16),
(67, 'Cerveja pilsen', 16),
(68, 'Espinafre', 2),
(69, 'Couve-manteiga', 2),
(70, 'Abacaxi', 15),
(71, 'Morango', 15),
(72, 'Milho de pipoca', 1),
(73, 'Granola', 1),
(74, 'Rúcula', 2),
(75, 'Agrião', 2),
(76, 'Repolho', 2),
(77, 'Abobrinha', 2),
(78, 'Geleia de morango', 3),
(79, 'Geleia de uva', 3),
(80, 'Banha de porco', 4),
(81, 'Óleo de girassol', 4),
(82, 'Sardinha', 5),
(83, 'Atum fresco', 5),
(84, 'Bacalhau', 5),
(85, 'Carne moída', 6),
(86, 'Costela suína', 6),
(87, 'Bacon', 6),
(88, 'Peito de peru', 6),
(89, 'Creme de leite', 7),
(90, 'Leite condensado', 7),
(91, 'Queijo prato', 7),
(92, 'Ricota', 7),
(93, 'Ovo de codorna', 8),
(94, 'Açúcar mascavo', 9),
(95, 'Açúcar de confeiteiro', 9),
(96, 'Rapadura', 9),
(97, 'Fermento químico', 10),
(98, 'Bicarbonato de sódio', 10),
(99, 'Sopa instantânea', 11),
(100, 'Cereal matinal', 11),
(101, 'Lasanha congelada', 12),
(102, 'Pizza congelada', 12),
(103, 'Ervilha seca', 13),
(104, 'Soja em grãos', 13),
(105, 'Amendoim', 14),
(106, 'Amêndoa', 14),
(107, 'Pistache', 14),
(108, 'Uva', 15),
(109, 'Melancia', 15),
(110, 'Limão', 15),
(111, 'Pera', 15),
(112, 'Manga', 15),
(113, 'Chá mate', 16),
(114, 'Vinho tinto', 16),
(115, 'Cerveja artesanal', 16),
(116, 'Azeitona verde', 17),
(117, 'Picles', 17),
(118, 'Atum em lata', 17),
(119, 'Pão de queijo congelado', 18),
(120, 'Legumes congelados', 18),
(121, 'Cominho', 19),
(122, 'Noz-moscada', 19),
(123, 'Páprica doce', 19),
(124, 'Molho shoyu', 20),
(125, 'Molho inglês', 20),
(126, 'Vinagre de maçã', 20),
(127, 'Berinjela', 2),
(128, 'Pepino', 2),
(129, 'Óleo de milho', 4),
(130, 'Presunto', 6),
(131, 'Salame', 6),
(132, 'Queijo parmesão', 7),
(133, 'Requeijão', 7),
(134, 'Melaço', 9),
(135, 'Semente de girassol', 14),
(136, 'Maracujá', 15),
(137, 'Kiwi', 15),
(138, 'Água de coco', 16),
(139, 'Refrigerante de guaraná', 16),
(140, 'Sardinha em lata', 17),
(141, 'Nuggets de frango', 18),
(142, 'Alecrim', 19),
(143, 'Hortelã', 19),
(144, 'Molho de tomate', 20),
(145, 'Pimenta tabasco', 20),
(146, 'Centeio', 1),
(147, 'Cevada', 1),
(148, 'Farinha de rosca', 1),
(149, 'Farinha de milho', 1),
(150, 'Acelga', 2),
(151, 'Chicória', 2),
(152, 'Nabo', 2),
(153, 'Rabanete', 2),
(154, 'Quiabo', 2),
(155, 'Maxixe', 2),
(156, 'Vagem', 2),
(157, 'Chocolate branco', 3),
(158, 'Manteiga de cacau', 3),
(159, 'Óleo de canola', 4),
(160, 'Óleo de coco', 4),
(161, 'Gordura vegetal hidrogenada', 4),
(162, 'Lula', 5),
(163, 'Polvo', 5),
(164, 'Mexilhão', 5),
(165, 'Ostra', 5),
(166, 'Filé de Merluza', 5),
(167, 'Alcatra', 6),
(168, 'Picanha', 6),
(169, 'Maminha', 6),
(170, 'Fígado bovino', 6),
(171, 'Moela de frango', 6),
(172, 'Pato', 6),
(173, 'Queijo gorgonzola', 7),
(174, 'Queijo provolone', 7),
(175, 'Queijo minas frescal', 7),
(176, 'Leite fermentado', 7),
(177, 'Chantilly', 7),
(178, 'Clara de ovo pasteurizada', 8),
(179, 'Gema de ovo pasteurizada', 8),
(180, 'Glicose de milho', 9),
(181, 'Pasta americana', 9),
(182, 'Açúcar demerara', 9),
(183, 'Bicarbonato de amônio', 10),
(184, 'Glutamato monossódico', 10),
(185, 'Barra de ceral', 11),
(186, 'Leite de soja', 11),
(187, 'Tofu', 11),
(188, 'Kibe congelado', 12),
(189, 'Coxinha congelada', 12),
(190, 'Lasanha à bolonhesa', 12),
(191, 'Ervilha torta', 13),
(192, 'Feijão branco', 13),
(193, 'Feijão fradinho', 13),
(194, 'Avelã', 14),
(195, 'Macadâmia', 14),
(196, 'Semente de abóbora', 14),
(197, 'Chia', 14),
(198, 'Pêssego', 15),
(199, 'Ameixa', 15),
(200, 'Caqui', 15),
(201, 'Figo', 15),
(202, 'Goiaba', 15),
(203, 'Melão', 15),
(204, 'Vinho branco', 16),
(205, 'Espumante', 16),
(206, 'Cachaça', 16),
(207, 'Vodka', 16),
(208, 'Suco de uva integral', 16),
(209, 'Cogumelo champignon', 17),
(210, 'Tomate seco', 17),
(211, 'Alcaparras', 17),
(212, 'Brócolis congelado', 18),
(213, 'Açaí polpa', 18),
(214, 'Açafrão da terra (cúrcuma)', 19),
(215, 'Gengibre em pó', 19),
(216, 'Cravo da índia', 19),
(217, 'Louro em folhas', 19),
(218, 'Molho barbecue', 20),
(219, 'Molho tártaro', 20),
(220, 'Molho de pimenta', 20);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 1: Cereais e derivados
(221, 'Farinha de centeio', 1),
(222, 'Fubá', 1),
(223, 'Polvilho doce', 1),
(224, 'Polvilho azedo', 1),
(225, 'Trigo para quibe', 1),
(226, 'Tapioca', 1),
(227, 'Sagu', 1),

-- Grupo 2: Verduras, hortaliças e derivados
(228, 'Couve-flor', 2),
(229, 'Alho-poró', 2),
(230, 'Rúcula hidropônica', 2),
(231, 'Alface americana', 2),
(232, 'Alface crespa', 2),
(233, 'Cebola roxa', 2),
(234, 'Pimentão verde', 2),
(235, 'Pimentão vermelho', 2),
(236, 'Mandioca', 2),

-- Grupo 3: Frutos e derivados
(237, 'Achocolatado em pó', 3),
(238, 'Cobertura de chocolate', 3),

-- Grupo 4: Gorduras e óleos
(239, 'Azeite de dendê', 4),
(240, 'Óleo de amendoim', 4),
(241, 'Manteiga ghee', 4),

-- Grupo 5: Pescados e frutos do mar
(242, 'Pintado', 5),
(243, 'Dourado', 5),
(244, 'Filé de panga', 5),
(245, 'Surimi (Kani)', 5),

-- Grupo 6: Carnes e derivados
(246, 'Fraldinha', 6),
(247, 'Contrafilé', 6),
(248, 'Patinho', 6),
(249, 'Coxão mole', 6),
(250, 'Coxão duro', 6),
(251, 'Lagarto bovino', 6),
(252, 'Pernil suíno', 6),
(253, 'Bisteca suína', 6),
(254, 'Coxa de frango', 6),
(255, 'Sobrecoxa de frango', 6),
(256, 'Asa de frango', 6),
(257, 'Coração de frango', 6),

-- Grupo 7: Leite e derivados
(258, 'Queijo coalho', 7),
(259, 'Queijo camembert', 7),
(260, 'Queijo roquefort', 7),
(261, 'Leite desnatado', 7),
(262, 'Creme de ricota', 7),
(263, 'Iogurte grego', 7),

-- Grupo 8: Ovos e derivados
(264, 'Ovo caipira', 8),

-- Grupo 9: Produtos açucarados
(265, 'Xarope de guaraná', 9),
(266, 'Calda de caramelo', 9),
(267, 'Calda de morango', 9),

-- Grupo 10: Miscelâneas
(268, 'Sal grosso', 10),
(269, 'Sal rosa do Himalaia', 10),
(270, 'Fermento biológico seco', 10),
(271, 'Fermento biológico fresco', 10),

-- Grupo 11: Outros alimentos industrializados
(272, 'Macarrão instantâneo', 11),
(273, 'Biscoito água e sal', 11),
(274, 'Bolacha maisena', 11),

-- Grupo 12: Alimentos preparados
(275, 'Pão de forma', 12),
(276, 'Pão integral', 12),
(277, 'Pão sírio', 12),
(278, 'Massa de pastel', 12),
(279, 'Massa de pizza', 12),

-- Grupo 13: Leguminosas e derivados
(280, 'Feijão vermelho', 13),
(281, 'Feijão azuki', 13),

-- Grupo 14: Nozes e sementes
(282, 'Castanha-do-pará', 14),
(283, 'Pinhão', 14),
(284, 'Semente de linhaça', 14),

-- Grupo 15: Frutas e derivados
(285, 'Acerola', 15),
(286, 'Carambola', 15),
(287, 'Amora', 15),
(288, 'Framboesa', 15),
(289, 'Mirtilo', 15),
(290, 'Pitaya', 15),
(291, 'Tangerina', 15),
(292, 'Ponkan', 15),

-- Grupo 16: Bebidas (alcoólicas e não alcoólicas)
(293, 'Chá verde', 16),
(294, 'Chá de camomila', 16),
(295, 'Café em grãos', 16),
(296, 'Café solúvel', 16),
(297, 'Energético', 16),
(298, 'Gin', 16),
(299, 'Rum', 16),
(300, 'Tequila', 16),

-- Grupo 17: Conservas e Enlatados
(301, 'Cebolinha em conserva', 17),
(302, 'Ovo de codorna em conserva', 17),
(303, 'Aspargos em conserva', 17),
(304, 'Azeitona preta', 17),

-- Grupo 18: Congelados e Prontos
(305, 'Pão de alho congelado', 18),
(306, 'Hambúrguer de frango', 18),
(307, 'Sorvete de creme', 18),
(308, 'Sorvete de chocolate', 18),

-- Grupo 19: Especiarias e Ervas
(309, 'Salsinha desidratada', 19),
(310, 'Cebolinha desidratada', 19),
(311, 'Coentro em pó', 19),
(312, 'Chimichurri', 19),
(313, 'Curry', 19),
(314, 'Zimbro', 19),
(315, 'Anis estrelado', 19),
(316, 'Pimenta calabresa', 19),

-- Grupo 20: Molhos e Condimentos
(317, 'Molho de alho', 20),
(318, 'Molho de mostarda e mel', 20),
(319, 'Molho pesto', 20),
(320, 'Molho rosê', 20);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 1: Cereais e derivados
(321, 'Macarrão de arroz', 1),
(322, 'Creme de arroz', 1),
(323, 'Sêmola de trigo', 1),
(324, 'Farelo de aveia', 1),
(325, 'Farinha de centeio integral', 1),

-- Grupo 2: Verduras, hortaliças e derivados
(326, 'Jiló', 2),
(327, 'Chuchu', 2),
(328, 'Inhame', 2),
(329, 'Cará', 2),
(330, 'Alho', 2),
(331, 'Escarola', 2),
(332, 'Taioba', 2),
(333, 'Couve-de-bruxelas', 2),
(334, 'Alcachofra', 2),
(335, 'Brotos de feijão (Moyashi)', 2),

-- Grupo 3: Frutos e derivados (Cacau, achocolatados, geleias)
(336, 'Cacau em favas', 3),
(337, 'Gotas de chocolate', 3),
(338, 'Geleia de damasco', 3),
(339, 'Nibs de cacau', 3),

-- Grupo 4: Gorduras e óleos
(340, 'Azeite trufado', 4),
(341, 'Banha bovina', 4),
(342, 'Óleo de gergelim', 4),

-- Grupo 5: Pescados e frutos do mar
(343, 'Cação', 5),
(344, 'Truta', 5),
(345, 'Anchova', 5),
(346, 'Manjuba', 5),
(347, 'Lagosta', 5),
(348, 'Caranguejo', 5),

-- Grupo 6: Carnes e derivados
(349, 'Cupim', 6),
(350, 'Costela bovina', 6),
(351, 'Lombo suíno', 6),
(352, 'Peito de frango', 6),
(353, 'Carne de sol', 6),
(354, 'Charque', 6),
(355, 'Copa lombo', 6),
(356, 'Linguiça calabresa', 6),
(357, 'Linguiça toscana', 6),
(358, 'Salsicha', 6),

-- Grupo 7: Leite e derivados
(359, 'Queijo brie', 7),
(360, 'Queijo gouda', 7),
(361, 'Queijo estepe', 7),
(362, 'Queijo do reino', 7),
(363, 'Iogurte de morango', 7),
(364, 'Kefir', 7),
(365, 'Manteiga sem sal', 7),
(366, 'Nata', 7),

-- Grupo 8: Ovos e derivados
(367, 'Ovo de pata', 8),
(368, 'Ovo de avestruz', 8),
(369, 'Ovo de codorna em conserva (pote)', 8),

-- Grupo 9: Produtos açucarados
(370, 'Stevia', 9),
(371, 'Xilitol', 9),
(372, 'Eritritol', 9),
(373, 'Açúcar orgânico', 9),
(374, 'Calda de chocolate', 9),
(375, 'Açúcar de coco', 9),

-- Grupo 10: Miscelâneas
(376, 'Sal light', 10),
(377, 'Sal marinho', 10),
(378, 'Ágar-ágar', 10),
(379, 'Corante alimentício', 10),

-- Grupo 11: Outros alimentos industrializados
(380, 'Biscoito recheado', 11),
(381, 'Wafer', 11),
(382, 'Batata palha', 11),
(383, 'Mistura para panqueca', 11),

-- Grupo 12: Alimentos preparados
(384, 'Esfiha congelada', 12),
(385, 'Quiche', 12),
(386, 'Empadão de frango', 12),
(387, 'Pão de alho resfriado', 12),
(388, 'Caldo de carne em cubo', 12),

-- Grupo 13: Leguminosas e derivados
(389, 'Fava', 13),
(390, 'Feijão rosinha', 13),
(391, 'Lentilha vermelha', 13),
(392, 'Feijão jalo', 13),
(393, 'Feijão bolinha', 13),

-- Grupo 14: Nozes e sementes
(394, 'Castanha de baru', 14),
(395, 'Noz pecã', 14),
(396, 'Semente de melancia', 14),
(397, 'Castanha portuguesa', 14),
(398, 'Semente de papoula', 14),

-- Grupo 15: Frutas e derivados
(399, 'Jaca', 15),
(400, 'Caju', 15),
(401, 'Graviola', 15),
(402, 'Cupuaçu', 15),
(403, 'Tamarindo', 15),
(404, 'Romã', 15),
(405, 'Lichia', 15),
(406, 'Cereja fresca', 15),

-- Grupo 16: Bebidas (alcoólicas e não alcoólicas)
(407, 'Licor de cacau', 16),
(408, 'Conhaque', 16),
(409, 'Uísque', 16),
(410, 'Chá preto', 16),
(411, 'Água tônica', 16),
(412, 'Leite de coco', 16),

-- Grupo 17: Conservas e Enlatados
(413, 'Tremoço em conserva', 17),
(414, 'Pêssego em calda', 17),
(415, 'Abacaxi em calda', 17),
(416, 'Cereja ao marrasquino', 17),

-- Grupo 18: Congelados e Prontos
(417, 'Polpa de maracujá congelada', 18),
(418, 'Almôndegas congeladas', 18),
(419, 'Batata rústica congelada', 18),

-- Grupo 19: Especiarias e Ervas
(420, 'Tomilho', 19);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 8: Ovos e derivados (Foco: grupo com menos produtos originalmente)
(421, 'Clara de ovo desidratada em pó', 8),
(422, 'Gema de ovo em pó', 8),
(423, 'Ovo líquido integral pasteurizado', 8),
(424, 'Ovo de gansa', 8),
(425, 'Ovo de galinha caipira orgânico', 8),
(426, 'Ovo enriquecido com Ômega 3', 8),
(427, 'Ovo centenário', 8),
(428, 'Fios de ovos', 8),
(429, 'Ovo de galinha branco tipo Extra', 8),
(430, 'Ovo de galinha vermelho tipo Jumbo', 8),

-- Grupo 3: Frutos e derivados (Foco: doces, cacau e geleias)
(431, 'Geleia de framboesa', 3),
(432, 'Geleia de pimenta', 3),
(433, 'Pasta de cacau', 3),
(434, 'Manteiga de cacau em pó', 3),
(435, 'Geleia de frutas vermelhas', 3),
(436, 'Marmelada', 3),
(437, 'Goiabada cascão', 3),
(438, 'Geleia de amora', 3),
(439, 'Geleia de jabuticaba', 3),
(440, 'Geleia de laranja', 3),

-- Grupo 10: Miscelâneas (Foco: aditivos, sais e essências)
(441, 'Cremor tártaro', 10),
(442, 'Ácido cítrico', 10),
(443, 'Sal defumado', 10),
(444, 'Sal negro', 10),
(445, 'Corante caramelo', 10),
(446, 'Essência de baunilha', 10),
(447, 'Extrato de baunilha', 10),
(448, 'Água de rosas', 10),
(449, 'Água de laranjeira', 10),
(450, 'Aromatizante sabor manteiga', 10),

-- Grupo 11: Outros alimentos industrializados (Foco: misturas secas e biscoitos)
(451, 'Mistura para pudim', 11),
(452, 'Pó para preparo de sorvete', 11),
(453, 'Sopa desidratada de cebola', 11),
(454, 'Biscoito tipo Maria', 11),
(455, 'Biscoito de maizena achocolatado', 11),
(456, 'Cereal matinal de milho com açúcar', 11),
(457, 'Biscoito de polvilho doce', 11),
(458, 'Biscoito de polvilho azedo', 11),
(459, 'Snack de batata (chips)', 11),
(460, 'Salgadinho de milho', 11),

-- Grupo 12: Alimentos preparados (Foco: massas e pães padronizados)
(461, 'Massa fresca para ravióli', 12),
(462, 'Massa fresca para nhoque', 12),
(463, 'Pão de hambúrguer', 12),
(464, 'Pão de cachorro-quente', 12),
(465, 'Bolo inglês', 12),
(466, 'Massa de panqueca pronta', 12),
(467, 'Wrap (Massa tipo tortilha)', 12),
(468, 'Pão australiano', 12),
(469, 'Baguete', 12),
(470, 'Croissant pré-assado', 12),

-- Grupo 18: Congelados e Prontos (Foco: porções e acompanhamentos)
(471, 'Mandioca palito congelada', 18),
(472, 'Anéis de cebola congelados', 18),
(473, 'Isca de peixe empanada congelada', 18),
(474, 'Hambúrguer de soja congelado', 18),
(475, 'Prato feito congelado (Frango com batata)', 18),
(476, 'Polpa de morango congelada', 18),
(477, 'Polpa de abacaxi congelada', 18),
(478, 'Torta de frango congelada', 18),
(479, 'Dadinho de tapioca congelado', 18),
(480, 'Churros congelados', 18),

-- Grupo 4: Gorduras e óleos
(481, 'Óleo de algodão', 4),
(482, 'Óleo de linhaça', 4),
(483, 'Óleo de abacate', 4),
(484, 'Manteiga de garrafa', 4),
(485, 'Óleo de palma', 4),
(486, 'Gordura de pato', 4),
(487, 'Gordura vegetal para fritura', 4),
(488, 'Margarina folhada', 4),
(489, 'Creme vegetal', 4),
(490, 'Azeite de oliva extravirgem orgânico', 4),

-- Grupo 9: Produtos açucarados
(491, 'Melado de cana', 9),
(492, 'Xarope de milho', 9),
(493, 'Xarope de bordo (Maple syrup)', 9),
(494, 'Açúcar invertido', 9),
(495, 'Açúcar de beterraba', 9),
(496, 'Fondant', 9),
(497, 'Glicerina bidestilada (uso alimentício)', 9),
(498, 'Açúcar cristal colorido', 9),
(499, 'Isomalte', 9),
(500, 'Sucralose', 9),

-- Grupo 13: Leguminosas e derivados
(501, 'Lentilha verde', 13),
(502, 'Feijão manteiga', 13),
(503, 'Feijão de corda', 13),
(504, 'Feijão verde', 13),
(505, 'Feijão preto orgânico', 13),
(506, 'Farinha de grão-de-bico', 13),
(507, 'Proteína texturizada de soja', 13),
(508, 'Farinha de soja', 13),
(509, 'Ervilha partida', 13),
(510, 'Tremoço seco', 13),

-- Grupo 17: Conservas e Enlatados
(511, 'Extrato de tomate', 17),
(512, 'Tomate pelado em lata', 17),
(513, 'Patê de presunto em lata', 17),
(514, 'Carne bovina em conserva', 17),
(515, 'Picles de pepino agridoce', 17),
(516, 'Cebola em conserva', 17),
(517, 'Figo em calda', 17),
(518, 'Cereja em calda', 17),
(519, 'Jalapeño em conserva', 17),
(520, 'Kimchi em conserva', 17);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 8: Ovos e derivados
(521, 'Ovo de peru', 8),
(522, 'Ovo de codorna defumado', 8),
(523, 'Ovo em conserva com beterraba', 8),
(524, 'Clara em neve liofilizada', 8),
(525, 'Omelete desidratada', 8),
(526, 'Ovo líquido com sal', 8),
(527, 'Ovo de pata caipira', 8),
(528, 'Fios de ovos cristalizados', 8),
(529, 'Ovo de galinha d''angola', 8),
(530, 'Suspiro (merengue) cru', 8),

-- Grupo 3: Frutos e derivados (Foco: Cacau, doces e geleias)
(531, 'Geleia de pêssego', 3),
(532, 'Geleia de cupuaçu', 3),
(533, 'Geleia de menta', 3),
(534, 'Cacau alcalino', 3),
(535, 'Manteiga de cacau temperada', 3),
(536, 'Geleia de maracujá', 3),
(537, 'Doce de marmelo em barra', 3),
(538, 'Doce de figo em pasta', 3),
(539, 'Geleia de kiwi', 3),
(540, 'Geleia de mirtilo', 3),

-- Grupo 10: Miscelâneas
(541, 'Sal marinho grosso', 10),
(542, 'Sal de aipo', 10),
(543, 'Ácido ascórbico (vitamina C)', 10),
(544, 'Essência de amêndoa', 10),
(545, 'Essência de rum', 10),
(546, 'Corante vermelho morango', 10),
(547, 'Corante azul anis', 10),
(548, 'Gelatina incolor em folha', 10),
(549, 'Pectina cítrica', 10),
(550, 'Alúmen de potássio', 10),

-- Grupo 11: Outros alimentos industrializados
(551, 'Biscoito champanhe', 11),
(552, 'Torrada integral', 11),
(553, 'Torrada sabor alho', 11),
(554, 'Biscoito amanteigado', 11),
(555, 'Salgadinho sabor queijo', 11),
(556, 'Cereal matinal de chocolate', 11),
(557, 'Aveia com mel industrializada', 11),
(558, 'Biscoito recheado de morango', 11),
(559, 'Bolo de caneca em pó', 11),
(560, 'Pudim de caixinha sabor caramelo', 11),

-- Grupo 12: Alimentos preparados
(561, 'Empada pronta de palmito', 12),
(562, 'Pastel de forno de queijo', 12),
(563, 'Pão sírio integral', 12),
(564, 'Massa para rolinho primavera', 12),
(565, 'Massa folhada pronta', 12),
(566, 'Nhoque recheado de queijo', 12),
(567, 'Torta de maçã pronta', 12),
(568, 'Esfiha de carne de soja', 12),
(569, 'Kibe de forno recheado', 12),
(570, 'Pão de mel embalado', 12),

-- Grupo 18: Congelados e Prontos
(571, 'Pão de queijo recheado congelado', 18),
(572, 'Hambúrguer de frango empanado', 18),
(573, 'Falafel congelado', 18),
(574, 'Sopa de legumes congelada', 18),
(575, 'Massa de pizza congelada', 18),
(576, 'Polpa de manga congelada', 18),
(577, 'Polpa de cajá congelada', 18),
(578, 'Croquete de carne congelado', 18),
(579, 'Coxinha de frango com catupiry congelada', 18),
(580, 'Escondidinho de carne seca congelado', 18),

-- Grupo 4: Gorduras e óleos
(581, 'Azeite de dendê refinado', 4),
(582, 'Óleo de cártamo', 4),
(583, 'Óleo de semente de uva', 4),
(584, 'Óleo de noz', 4),
(585, 'Óleo de macadâmia', 4),
(586, 'Banha suína temperada', 4),
(587, 'Manteiga com sal', 4),
(588, 'Manteiga clarificada', 4),
(589, 'Margarina com fitoesteróis', 4),
(590, 'Óleo de amendoim torrado', 4),

-- Grupo 9: Produtos açucarados
(591, 'Açúcar orgânico claro', 9),
(592, 'Açúcar mascavo orgânico', 9),
(593, 'Xarope de groselha', 9),
(594, 'Glucose líquida', 9),
(595, 'Caramelo líquido', 9),
(596, 'Gotas de caramelo', 9),
(597, 'Cobertura de morango para sorvete', 9),
(598, 'Cobertura de chocolate para sorvete', 9),
(599, 'Stevia líquida', 9),
(600, 'Eritritol em pó', 9),

-- Grupo 13: Leguminosas e derivados
(601, 'Feijão rajado', 13),
(602, 'Feijão roxinho', 13),
(603, 'Feijão moyashi', 13),
(604, 'Lentilha amarela', 13),
(605, 'Grão-de-bico torrado', 13),
(606, 'Farinha de ervilha', 13),
(607, 'Massa de soja (Missô)', 13),
(608, 'Tofu defumado', 13),
(609, 'Tremoço em grãos', 13),
(610, 'Farinha de feijão branco', 13),

-- Grupo 17: Conservas e Enlatados
(611, 'Azeitona preta fatiada', 17),
(612, 'Cebolinha cristal em conserva', 17),
(613, 'Champignon fatiado em conserva', 17),
(614, 'Pimenta biquinho em conserva', 17),
(615, 'Batatinha em conserva', 17),
(616, 'Cenoura baby em conserva', 17),
(617, 'Salsicha em lata', 17),
(618, 'Fiambre em lata', 17),
(619, 'Aspargos brancos em conserva', 17),
(620, 'Alcachofra em conserva', 17);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 8: Ovos e derivados (Foco principal)
(621, 'Ovo de avestruz liofilizado', 8),
(622, 'Gema curada ralada', 8),
(623, 'Ovo de galinha azul', 8),
(624, 'Clara de ovo em caixinha', 8),
(625, 'Ovo pochê congelado', 8),
(626, 'Gema de ovo caipira pasteurizada', 8),
(627, 'Ovo de codorna colorido', 8),
(628, 'Merengue suíço pronto', 8),
(629, 'Suspiro com limão', 8),
(630, 'Ovo de perua', 8),
(631, 'Ovo com dupla gema', 8),

-- Grupo 3: Frutos e derivados (Foco: doces e cacau)
(632, 'Geleia de pimenta biquinho', 3),
(633, 'Goiabada branca', 3),
(634, 'Doce de abóbora com coco', 3),
(635, 'Cacau em pó 70%', 3),
(636, 'Geleia de damasco diet', 3),
(637, 'Marmelada branca', 3),
(638, 'Pasta de amendoim com cacau', 3),
(639, 'Geleia de frutas amarelas', 3),
(640, 'Doce de cidra ralada', 3),
(641, 'Geleia de physalis', 3),
(642, 'Cacau ruby em gotas', 3),

-- Grupo 10: Miscelâneas
(643, 'Sal do Havaí (sal vermelho)', 10),
(644, 'Flor de sal', 10),
(645, 'Sal de parrilla com ervas', 10),
(646, 'Amaciante de carne em pó', 10),
(647, 'Corante em pó dourado', 10),
(648, 'Ácido málico', 10),
(649, 'Essência de morango', 10),
(650, 'Essência de coco', 10),
(651, 'Goma xantana', 10),
(652, 'Goma guar', 10),
(653, 'Caldo de legumes em pó', 10),

-- Grupo 11: Outros alimentos industrializados
(654, 'Biscoito de arroz', 11),
(655, 'Biscoito wafer de limão', 11),
(656, 'Salgadinho de batata em tubo', 11),
(657, 'Torrada de alho e salsa', 11),
(658, 'Massa de tapioca hidratada', 11),
(659, 'Biscoito de polvilho com queijo', 11),
(660, 'Aveia em flocos finos', 11),
(661, 'Granola sem glúten', 11),
(662, 'Mistura para bolo de cenoura', 11),
(663, 'Mistura para brownie', 11),
(664, 'Biscoito integral com castanhas', 11),

-- Grupo 12: Alimentos preparados
(665, 'Massa de pizza brotinho', 12),
(666, 'Massa para lasanha fresca', 12),
(667, 'Pão de forma sem casca', 12),
(668, 'Pão de brioche', 12),
(669, 'Tortilha de trigo', 12),
(670, 'Quiche de alho-poró', 12),
(671, 'Empada de camarão', 12),
(672, 'Pão de batata', 12),
(673, 'Pão de cebola', 12),
(674, 'Bolo de mandioca pronto', 12),
(675, 'Bolo de fubá pronto', 12),

-- Grupo 18: Congelados e Prontos
(676, 'Pizza de calabresa congelada', 18),
(677, 'Waffles congelados', 18),
(678, 'Batata smile congelada', 18),
(679, 'Polenta palito congelada', 18),
(680, 'Filé de frango empanado congelado', 18),
(681, 'Almôndega vegetal congelada', 18),
(682, 'Polpa de graviola congelada', 18),
(683, 'Polpa de cupuaçu congelada', 18),
(684, 'Lasanha de frango congelada', 18),
(685, 'Escondidinho de frango congelado', 18),
(686, 'Nhoque congelado', 18),

-- Grupo 4: Gorduras e óleos
(687, 'Margarina sem sal', 4),
(688, 'Óleo de canola prensado a frio', 4),
(689, 'Azeite de oliva aromatizado com alho', 4),
(690, 'Azeite de oliva aromatizado com trufas', 4),
(691, 'Manteiga de amendoim', 4),
(692, 'Manteiga de castanha de caju', 4),
(693, 'Óleo de gergelim torrado', 4),
(694, 'Gordura de coco', 4),
(695, 'Gordura de palma', 4),
(696, 'Óleo de chia', 4),
(697, 'Óleo de pequi', 4),

-- Grupo 9: Produtos açucarados
(698, 'Açúcar gelado (impalpável)', 9),
(699, 'Calda de cereja', 9),
(700, 'Xarope de menta', 9),
(701, 'Xarope de morango', 9),
(702, 'Mel de laranjeira', 9),
(703, 'Mel de eucalipto', 9),
(704, 'Melaço de romã', 9),
(705, 'Extrato de malte', 9),
(706, 'Adoçante à base de sucralose', 9),
(707, 'Adoçante à base de aspartame', 9),
(708, 'Frutose em pó', 9),

-- Grupo 13: Leguminosas e derivados
(709, 'Feijão cavalo', 13),
(710, 'Fava rajada', 13),
(711, 'Ervilha verde partida', 13),
(712, 'Feijão preto premium', 13),
(713, 'Edamame congelado', 13),
(714, 'Grão-de-bico em pó', 13),
(715, 'Macarrão de feijão preto', 13),
(716, 'Lentilha canadense', 13),
(717, 'Lentilha beluga (preta)', 13),
(718, 'Pasta de soja temperada', 13),
(719, 'Proteína de ervilha', 13),
(720, 'Farinha de lentilha', 13);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 1: Cereais e derivados
(721, 'Farinha de mandioca torrada', 1),
(722, 'Farinha de puba', 1),
(723, 'Milho para canjica', 1),
(724, 'Trigo em grão', 1),
(725, 'Flocos de milho pré-cozidos', 1),

-- Grupo 2: Verduras, hortaliças e derivados
(726, 'Alho negro', 2),
(727, 'Radicchio', 2),
(728, 'Couve-rábano', 2),
(729, 'Nirá', 2),
(730, 'Broto de alfafa', 2),
(731, 'Folha de mostarda', 2),
(732, 'Serralha', 2),
(733, 'Ora-pro-nóbis', 2),
(734, 'Bertalha', 2),
(735, 'Tupinambo', 2),

-- Grupo 3: Frutos e derivados
(736, 'Doce de leite em barra', 3),
(737, 'Nibs de cacau caramelizados', 3),
(738, 'Geleia de pimenta com abacaxi', 3),
(739, 'Manteiga de cacau desodorizada', 3),
(740, 'Doce de batata-doce', 3),

-- Grupo 4: Gorduras e óleos
(741, 'Óleo de semente de abóbora', 4),
(742, 'Azeite de abacate', 4),
(743, 'Manteiga de tucumã', 4),
(744, 'Óleo de peixe', 4),
(745, 'Óleo de cártamo em cápsulas culinárias', 4),
(746, 'Azeite de licuri', 4),

-- Grupo 5: Pescados e frutos do mar
(747, 'Ostra defumada', 5),
(748, 'Caviar', 5),
(749, 'Ovas de capelin', 5),
(750, 'Sururu', 5),
(751, 'Vôngole', 5),
(752, 'Polvo em tentáculos', 5),
(753, 'Peixe-prego', 5),
(754, 'Linguado', 5),

-- Grupo 6: Carnes e derivados
(755, 'Lombo defumado', 6),
(756, 'Joelho de porco (Eisbein)', 6),
(757, 'Carne de avestruz', 6),
(758, 'Linguiça de javali', 6),
(759, 'Peito de pato (Magret)', 6),
(760, 'Salsichão', 6),
(761, 'Mortadela defumada', 6),
(762, 'Pastrami', 6),

-- Grupo 7: Leite e derivados
(763, 'Queijo coalho no palito', 7),
(764, 'Queijo pecorino', 7),
(765, 'Queijo grana padano', 7),
(766, 'Iogurte de ovelha', 7),
(767, 'Leite de cabra', 7),
(768, 'Nata fresca', 7),

-- Grupo 8: Ovos e derivados
(769, 'Ovo de codorna em calda', 8),
(770, 'Ovo em pó integral', 8),
(771, 'Clara liofilizada saborizada', 8),
(772, 'Gema pasteurizada adoçada', 8),

-- Grupo 9: Produtos açucarados
(773, 'Melaço de cana-de-açúcar', 9),
(774, 'Calda de caramelo salgado', 9),
(775, 'Açúcar sabor baunilha', 9),
(776, 'Açúcar mascavo em cubos', 9),
(777, 'Xarope de maçã', 9),
(778, 'Xarope de agave claro', 9),

-- Grupo 10: Miscelâneas
(779, 'Sal defumado em lascas', 10),
(780, 'Sal negro do Himalaia', 10),
(781, 'Bicarbonato de potássio', 10),
(782, 'Goma arábica', 10),
(783, 'Lecitina de soja', 10),
(784, 'Essência de panetone', 10),

-- Grupo 11: Outros alimentos industrializados
(785, 'Pão sueco', 11),
(786, 'Biscoito de polvilho frito', 11),
(787, 'Batata frita ondulada', 11),
(788, 'Macarrão de arroz bifum', 11),
(789, 'Biscoito cantuccini', 11),

-- Grupo 12: Alimentos preparados
(790, 'Caldo de galinha em pasta', 12),
(791, 'Massa de wrap integral', 12),
(792, 'Crepe suíço congelado', 12),
(793, 'Pão de queijo de frigideira', 12),
(794, 'Massa de torta podre', 12),

-- Grupo 13: Leguminosas e derivados
(795, 'Feijão mulatinho', 13),
(796, 'Grão-de-bico negro', 13),
(797, 'Lentilha de puy', 13),
(798, 'Fava amarela', 13),
(799, 'Ervilha com wasabi', 13),

-- Grupo 14: Nozes e sementes
(800, 'Castanha de sapucaia', 14),
(801, 'Semente de girassol torrada', 14),
(802, 'Pinoli', 14),
(803, 'Amendoim japonês', 14),
(804, 'Castanha de caju caramelizada', 14),

-- Grupo 15: Frutas e derivados
(805, 'Siriguela', 15),
(806, 'Umbu', 15),
(807, 'Mangaba', 15),
(808, 'Pitanga', 15),
(809, 'Tamarillo', 15),
(810, 'Fruta-pão', 15),
(811, 'Atemoia', 15),

-- Grupo 16: Bebidas (alcoólicas e não alcoólicas)
(812, 'Licor de café', 16),
(813, 'Vinho do porto', 16),
(814, 'Sidra de maçã', 16),
(815, 'Chá branco', 16),
(816, 'Kombucha', 16),
(817, 'Kefir de água', 16),

-- Grupo 17: Conservas e Enlatados
(818, 'Sardinha com molho de tomate em lata', 17),
(819, 'Patê de fígado em lata', 17),
(820, 'Alho em conserva', 17);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 1: Cereais e derivados
(821, 'Trigo sarraceno', 1),
(822, 'Amaranto em flocos', 1),
(823, 'Cuscuz marroquino', 1),
(824, 'Sêmola de milho', 1),
(825, 'Farelo de trigo', 1),

-- Grupo 2: Verduras, hortaliças e derivados
(826, 'Alface romana', 2),
(827, 'Catalonha', 2),
(828, 'Cebola puy', 2),
(829, 'Endívia', 2),
(830, 'Funcho (Erva-doce bulbo)', 2),
(831, 'Pimentão amarelo', 2),
(832, 'Pimenta cambuci', 2),
(833, 'Cebola pérola', 2),
(834, 'Repolho roxo', 2),
(835, 'Tomate cereja', 2),

-- Grupo 3: Frutos e derivados
(836, 'Nibs de cacau cru', 3),
(837, 'Geleia de goiaba', 3),
(838, 'Bananada sem açúcar', 3),
(839, 'Cocada branca', 3),
(840, 'Pé de moleque', 3),

-- Grupo 4: Gorduras e óleos
(841, 'Óleo de babaçu', 4),
(842, 'Óleo de castanha-do-pará', 4),
(843, 'Banha de galinha', 4),
(844, 'Margarina light', 4),
(845, 'Creme vegetal com sal', 4),

-- Grupo 5: Pescados e frutos do mar
(846, 'Peixe espada', 5),
(847, 'Robalo', 5),
(848, 'Badejo', 5),
(849, 'Peixe prego', 5),
(850, 'Vôngole em concha', 5),

-- Grupo 6: Carnes e derivados
(851, 'Picanha suína', 6),
(852, 'Fígado de frango', 6),
(853, 'Maminha suína', 6),
(854, 'Bife ancho', 6),
(855, 'Bife de chorizo', 6),
(856, 'Alcatra suína', 6),
(857, 'Carne de rã', 6),
(858, 'Codorna inteira abatida', 6),
(859, 'Bucho bovino (Dobradinha)', 6),
(860, 'Rabada bovina', 6),

-- Grupo 7: Leite e derivados
(861, 'Queijo cottage', 7),
(862, 'Queijo mascarpone', 7),
(863, 'Iogurte zero lactose', 7),
(864, 'Leite em pó integral', 7),
(865, 'Soro de leite em pó', 7),

-- Grupo 8: Ovos e derivados
(866, 'Ovo de gema mole industrializado', 8),
(867, 'Ovo caipira extra', 8),
(868, 'Clara pasteurizada em garrafa', 8),
(869, 'Mistura para ovo mexido', 8),
(870, 'Ovo de ema', 8),

-- Grupo 9: Produtos açucarados
(871, 'Açúcar cristal orgânico', 9),
(872, 'Adoçante líquido de stevia', 9),
(873, 'Calda de chocolate diet', 9),
(874, 'Bala de goma', 9),
(875, 'Pirulito de morango', 9),

-- Grupo 10: Miscelâneas
(876, 'Essência de amêndoas amargas', 10),
(877, 'Ácido tartárico', 10),
(878, 'Citrato de sódio', 10),
(879, 'Polvilho antiumectante', 10),
(880, 'Pimenta rosa (Aroeira)', 10),

-- Grupo 11: Outros alimentos industrializados
(881, 'Macarrão de letrinhas', 11),
(882, 'Biscoito grissini', 11),
(883, 'Torrada de centeio', 11),
(884, 'Flocão de milho', 11),
(885, 'Salgadinho de queijo assado', 11),

-- Grupo 12: Alimentos preparados
(886, 'Sanduíche natural pronto', 12),
(887, 'Salada de frutas no pote', 12),
(888, 'Coxinha de jaca', 12),
(889, 'Kibe de soja', 12),
(890, 'Pão folha', 12),

-- Grupo 13: Leguminosas e derivados
(891, 'Feijão andu', 13),
(892, 'Ervilha de quebra fresca', 13),
(893, 'Soja preta', 13),
(894, 'Amendoim cru', 13),
(895, 'Farinha de ervilha torrada', 13),

-- Grupo 14: Nozes e sementes
(896, 'Semente de linhaça dourada', 14),
(897, 'Castanha de caju moída', 14),
(898, 'Amêndoa laminada', 14),
(899, 'Noz macadâmia torrada', 14),
(900, 'Semente de chia triturada', 14),

-- Grupo 15: Frutas e derivados
(901, 'Morango desidratado', 15),
(902, 'Damasco seco', 15),
(903, 'Uva passa preta', 15),
(904, 'Tâmara', 15),
(905, 'Cramberry desidratado', 15),

-- Grupo 16: Bebidas (alcoólicas e não alcoólicas)
(906, 'Chá de hibisco', 16),
(907, 'Água com gás', 16),
(908, 'Suco de maçã integral', 16),
(909, 'Licor de amarula', 16),
(910, 'Rum branco', 16),

-- Grupo 17: Conservas e Enlatados
(911, 'Sardinha em óleo', 17),
(912, 'Dueto de ervilha e milho em lata', 17),
(913, 'Salsicha Viena em lata', 17),
(914, 'Polvo enlatado', 17),
(915, 'Coração de alcachofra em conserva', 17),

-- Grupo 18: Congelados e Prontos
(916, 'Pão de queijo fit congelado', 18),
(917, 'Empanada argentina congelada', 18),

-- Grupo 19: Especiarias e Ervas
(918, 'Sálvia fresca', 19),
(919, 'Estragão', 19),

-- Grupo 20: Molhos e Condimentos
(920, 'Molho de ostra', 20);

INSERT INTO public.products (id, name, group_id) VALUES
-- Grupo 1: Cereais e derivados
(921, 'Massa de grano duro', 1),
(922, 'Sorgo em grãos', 1),
(923, 'Teff', 1),
(924, 'Farinha de arroz glutinoso', 1),
(925, 'Milheto', 1),

-- Grupo 2: Verduras, hortaliças e derivados
(926, 'Ceboulette', 2),
(927, 'Chicória frisée', 2),
(928, 'Mini cenoura', 2),
(929, 'Mini cebola', 2),
(930, 'Alho-poró baby', 2),
(931, 'Pimenta de cheiro', 2),
(932, 'Folha de uva', 2),

-- Grupo 3: Frutos e derivados
(933, 'Trufa de chocolate tradicional', 3),
(934, 'Ganache de chocolate pronta', 3),
(935, 'Mistura para fondue de chocolate', 3),
(936, 'Massa de marzipã', 3),

-- Grupo 4: Gorduras e óleos
(937, 'Óleo de avelã', 4),
(938, 'Óleo de amêndoa doce culinário', 4),
(939, 'Azeite de dendê artesanal', 4),
(940, 'Manteiga de macadâmia', 4),

-- Grupo 5: Pescados e frutos do mar
(941, 'Peixe sapo (Tamboril)', 5),
(942, 'Pescada branca', 5),
(943, 'Truta defumada', 5),
(944, 'Kani kama em palitos', 5),
(945, 'Caviar de salmão', 5),

-- Grupo 6: Carnes e derivados
(946, 'Bochecha bovina', 6),
(947, 'Língua de boi', 6),
(948, 'Fígado de pato (Foie gras)', 6),
(949, 'Bacon em cubos', 6),
(950, 'Chouriço', 6),

-- Grupo 7: Leite e derivados
(951, 'Queijo de cabra curado', 7),
(952, 'Queijo feta', 7),
(953, 'Queijo edam', 7),
(954, 'Creme de leite fresco', 7),
(955, 'Coalhada seca', 7),

-- Grupo 8: Ovos e derivados
(956, 'Ovo caipira orgânico', 8),
(957, 'Ovo líquido temperado', 8),
(958, 'Gema desidratada pasteurizada', 8),
(959, 'Ovo de pata extra', 8),

-- Grupo 9: Produtos açucarados
(960, 'Açúcar de beterraba refinado', 9),
(961, 'Xarope de agave escuro', 9),
(962, 'Caramelo em pó', 9),
(963, 'Glacê real em pó', 9),
(964, 'Extrato de baunilha com sementes', 9),

-- Grupo 10: Miscelâneas
(965, 'Sal com trufa branca', 10),
(966, 'Sal de ervas finas', 10),
(967, 'Fermento natural (Levain) desidratado', 10),
(968, 'Ágar-ágar em flocos', 10),
(969, 'Essência de laranja', 10),

-- Grupo 11: Outros alimentos industrializados
(970, 'Massa de pastel de rolo', 11),
(971, 'Biscoito de gengibre', 11),
(972, 'Cereal de arroz achocolatado', 11),
(973, 'Sopa de tomate em pó', 11),
(974, 'Croutons temperados', 11),

-- Grupo 12: Alimentos preparados
(975, 'Massa de esfiha aberta', 12),
(976, 'Croissant de chocolate pré-assado', 12),
(977, 'Quiche lorraine pronta', 12),
(978, 'Torta de limão congelada', 12),
(979, 'Sanduíche de metro', 12),

-- Grupo 13: Leguminosas e derivados
(980, 'Farinha de soja tostada (Kinako)', 13),
(981, 'Pasta de grão-de-bico (Homus)', 13),
(982, 'Feijão fava', 13),
(983, 'Ervilha partida amarela', 13),

-- Grupo 14: Nozes e sementes
(984, 'Pistache torrado e salgado', 14),
(985, 'Semente de papoula preta', 14),
(986, 'Castanha de baru torrada', 14),
(987, 'Semente de melão', 14),

-- Grupo 15: Frutas e derivados
(988, 'Nectarina', 15),
(989, 'Tangerina murcote', 15),
(990, 'Pêssego liofilizado', 15),
(991, 'Mirtilo desidratado', 15),

-- Grupo 16: Bebidas (alcoólicas e não alcoólicas)
(992, 'Saquê', 16),
(993, 'Pisco', 16),
(994, 'Suco de mirtilo', 16),
(995, 'Limonada suíça engarrafada', 16),

-- Grupo 17: Conservas e Enlatados
(996, 'Pimentão vermelho assado em conserva', 17),
(997, 'Alho confitado em óleo', 17),

-- Grupo 18: Congelados e Prontos
(998, 'Medalhão de carne congelado', 18),

-- Grupo 19: Especiarias e Ervas
(999, 'Aneto (Dill) fresco', 19),

-- Grupo 20: Molhos e Condimentos
(1000, 'Molho de gergelim (Tahine)', 20);

COMMIT;
INSERT INTO auth.users (instance_id,id,aud,"role",email,encrypted_password,email_confirmed_at,invited_at,confirmation_token,confirmation_sent_at,recovery_token,recovery_sent_at,email_change_token_new,email_change,email_change_sent_at,last_sign_in_at,raw_app_meta_data,raw_user_meta_data,is_super_admin,created_at,updated_at,phone,phone_confirmed_at,phone_change,phone_change_token,phone_change_sent_at,email_change_token_current,email_change_confirm_status,banned_until,reauthentication_token,reauthentication_sent_at,is_sso_user,deleted_at,is_anonymous) VALUES
	 ('00000000-0000-0000-0000-000000000000'::uuid,'b4bfb6a4-445f-4be7-8cc3-037b91e27ee7'::uuid,'authenticated','authenticated','pedrohenriquesj.pro@gmail.com',NULL,'2025-11-17 11:45:51.878318-03',NULL,'',NULL,'',NULL,'','',NULL,'2025-11-17 14:29:40.000611-03','{"provider": "google", "providers": ["google"]}','{"iss": "https://accounts.google.com", "sub": "100247897669381880694", "name": "Pedro Henrique", "email": "pedrohenriquesj.pro@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLKRljssA3EXXzSUlM_cQKXxeXLd-9xZCabfWPFXu42SQHfIkRB=s96-c", "full_name": "Pedro Henrique", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLKRljssA3EXXzSUlM_cQKXxeXLd-9xZCabfWPFXu42SQHfIkRB=s96-c", "provider_id": "100247897669381880694", "email_verified": true, "phone_verified": false}',NULL,'2025-11-17 11:45:51.866854-03','2025-11-17 14:29:40.003161-03',NULL,NULL,'','',NULL,'',0,NULL,'',NULL,false,NULL,false),
	 ('00000000-0000-0000-0000-000000000000'::uuid,'a5371483-5545-4dbf-9ab9-93a4fda5be81'::uuid,'authenticated','authenticated','piterhenou@gmail.com',NULL,'2025-11-17 11:43:50.337472-03',NULL,'',NULL,'',NULL,'','',NULL,'2025-11-17 14:30:25.374758-03','{"provider": "google", "providers": ["google"]}','{"iss": "https://accounts.google.com", "sub": "100354653385770016316", "name": "Pedro Henrique (Drk9)", "email": "piterhenou@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJ8BbK8zq4l4kfiLYMaF2RFCUE2i_udJuxdS2ntxNrb9sW6nFo=s96-c", "full_name": "Pedro Henrique (Drk9)", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJ8BbK8zq4l4kfiLYMaF2RFCUE2i_udJuxdS2ntxNrb9sW6nFo=s96-c", "provider_id": "100354653385770016316", "email_verified": true, "phone_verified": false}',NULL,'2025-11-17 11:43:50.327822-03','2025-11-17 14:30:25.377257-03',NULL,NULL,'','',NULL,'',0,NULL,'',NULL,false,NULL,false),
	 ('00000000-0000-0000-0000-000000000000'::uuid,'01961561-3b13-424b-bd33-4631b9bd273b'::uuid,'authenticated','authenticated','manin@gmail.com','$2a$10$GmTTPf2u0Vq5eVXTDXXhF.2Saj6mDpJkVTtDTWa.v7cyu.rpTg30m','2025-11-17 11:59:19.166277-03',NULL,'',NULL,'',NULL,'','',NULL,'2025-11-17 11:59:36.34326-03','{"provider": "email", "providers": ["email"]}','{"sub": "01961561-3b13-424b-bd33-4631b9bd273b", "email": "manin@gmail.com", "full_name": "Maninho", "email_verified": true, "phone_verified": false}',NULL,'2025-11-17 11:59:19.162198-03','2025-11-17 11:59:36.344807-03',NULL,NULL,'','',NULL,'',0,NULL,'',NULL,false,NULL,false);

INSERT INTO public.organizations (id,name,"type",created_by,created_at,cnpj,capacity,opening_date,full_address,zip_code,district,latitude,longitude,main_phone,alt_phone,institutional_email,updated_at,state_id,city_id,address,"number",address_complement) VALUES
	('08ccdabd-b8e0-48dc-82c6-f69a696e24c3'::uuid,'Rancho HMAR','uan',
    (SELECT id FROM auth.users WHERE email = 'pedrohenriquesj.pro@gmail.com' LIMIT 1),
    '2025-11-17 11:46:22.523937-03','84643764834948',NULL,NULL,NULL,'','',NULL,NULL,NULL,NULL,NULL,'2025-11-17 11:46:22.523937-03',NULL,NULL,'','',''),
	('1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,'Rancho HGUJP','uan',
    (SELECT id FROM auth.users WHERE email = 'piterhenou@gmail.com' LIMIT 1),
    '2025-11-17 11:45:14.502884-03','43434555563223',NULL,NULL,NULL,'','',NULL,NULL,'83991514481',NULL,NULL,'2025-11-17 11:45:14.502884-03',NULL,NULL,'','','');
INSERT INTO public.user_organizations (id, user_id, organization_id, profile_id, active, entry_date, exit_date, created_at)
VALUES (
  '99099ccd-0382-4a7f-8096-108811d5b76d'::uuid,
  'a5371483-5545-4dbf-9ab9-93a4fda5be81'::uuid,
  '1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1),
  true,
  '2025-11-17 11:45:14.517401-03',
  NULL,
  '2025-11-17 11:45:14.517401-03'
),
(
  'f28715b2-7e1e-420a-82a0-c72b502fe599'::uuid,
  'b4bfb6a4-445f-4be7-8cc3-037b91e27ee7'::uuid,
  '08ccdabd-b8e0-48dc-82c6-f69a696e24c3'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'cozinheiro' LIMIT 1),
  true,
  '2025-11-17 11:46:22.537707-03',
  NULL,
  '2025-11-17 11:46:22.537707-03'
),
(
  'e656a21f-d8bc-4e03-8b0e-1505a31f4911'::uuid,
  '01961561-3b13-424b-bd33-4631b9bd273b'::uuid,
  '1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'estoquista' LIMIT 1),
  true,
  '2025-11-17 11:59:40.612436-03',
  NULL,
  '2025-11-17 11:59:40.612436-03'
),
(
  '84dc9180-40d4-41d0-9ffa-0fa266c9696c'::uuid,
  'b4bfb6a4-445f-4be7-8cc3-037b91e27ee7'::uuid,
  '1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1),
  true,
  '2025-11-17 12:00:21.961516-03',
  NULL,
  '2025-11-17 12:00:21.961516-03'
);
INSERT INTO public.user_profiles (id, user_organization_id, profile_id, active, start_date, created_at) VALUES
	('e911758b-18f5-4358-83bf-ba5a45b56339'::uuid, '99099ccd-0382-4a7f-8096-108811d5b76d'::uuid, (SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1), true, '2025-11-17 11:45:14.526538-03', '2025-11-17 11:45:14.526538-03'),
	('46fb1b28-b97c-4224-96bd-85d3abfa540f'::uuid, 'f28715b2-7e1e-420a-82a0-c72b502fe599'::uuid, (SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1), true, '2025-11-17 11:46:22.543482-03', '2025-11-17 11:46:22.543482-03'),
	('9a59d8a6-4c1b-4f5d-846e-f4c4c3ac08d5'::uuid, 'e656a21f-d8bc-4e03-8b0e-1505a31f4911'::uuid, (SELECT id FROM public.profiles WHERE name ILIKE 'cozinheiro' LIMIT 1), true, '2025-11-17 11:59:40.621348-03', '2025-11-17 11:59:40.621348-03'),
	('08f9c42d-085d-4dee-899f-3744b610a0db'::uuid, '84dc9180-40d4-41d0-9ffa-0fa266c9696c'::uuid, (SELECT id FROM public.profiles WHERE name ILIKE 'estoquista' LIMIT 1), true, '2025-11-17 12:00:21.967704-03', '2025-11-17 12:00:21.967704-03');

INSERT INTO public.invites (id,email,organization_id,profile_id,status,invite_token,expires_at,invited_by,created_at,accepted_at,accepted_by,rejected_at,rejected_by,invited_by_name,invited_by_email,invited_by_avatar_url) VALUES
	('27b672a3-74ee-471d-87a1-fe233b07ccfe'::uuid,'joaofeijo@gmail.com',
	(SELECT id FROM public.organizations WHERE name = 'Rancho HGUJP' LIMIT 1),
	(SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1),
	'pending','a46ca7fe-b292-497d-82a1-4066d33b1bb5','2025-11-24 11:45:37.685-03',
	(SELECT id FROM auth.users WHERE email = 'piterhenou@gmail.com' LIMIT 1),
	'2025-11-17 11:45:37.689222-03',NULL,NULL,NULL,NULL,'Pedro Henrique (Drk9)','piterhenou@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJ8BbK8zq4l4kfiLYMaF2RFCUE2i_udJuxdS2ntxNrb9sW6nFo=s96-c'),
	('e0d908d9-8a11-42cc-a6ec-b242cc549272'::uuid,'manin@gmail.com',
	(SELECT id FROM public.organizations WHERE name = 'Rancho HGUJP' LIMIT 1),
	(SELECT id FROM public.profiles WHERE name ILIKE 'estoquista' LIMIT 1),
	'accepted','b7456fe8-2c20-4506-8f85-5bf37a36f7ac','2025-11-24 11:45:37.615-03',
	(SELECT id FROM auth.users WHERE email = 'piterhenou@gmail.com' LIMIT 1),
	'2025-11-17 11:45:37.621735-03','2025-11-17 11:59:40.6-03',
	(SELECT id FROM auth.users WHERE email = 'manin@gmail.com' LIMIT 1),
	NULL,NULL,'Pedro Henrique (Drk9)','piterhenou@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJ8BbK8zq4l4kfiLYMaF2RFCUE2i_udJuxdS2ntxNrb9sW6nFo=s96-c'),
	('67d52931-4722-4aae-8f9b-284414b57fc3'::uuid,'pedrohenriquesj.pro@gmail.com',
	(SELECT id FROM public.organizations WHERE name = 'Rancho HGUJP' LIMIT 1),
	(SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1),
	'accepted','b9752e32-19c2-407e-9b6c-5d6b2cac9643','2025-11-24 11:45:37.739-03',
	(SELECT id FROM auth.users WHERE email = 'piterhenou@gmail.com' LIMIT 1),
	'2025-11-17 11:45:37.743665-03','2025-11-17 12:00:21.952-03',
	(SELECT id FROM auth.users WHERE email = 'pedrohenriquesj.pro@gmail.com' LIMIT 1),
	NULL,NULL,'Pedro Henrique (Drk9)','piterhenou@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJ8BbK8zq4l4kfiLYMaF2RFCUE2i_udJuxdS2ntxNrb9sW6nFo=s96-c');

INSERT INTO public.departments (id,name,organization_id,department_type,created_at) VALUES
	('89a9eaa6-1f83-4df5-a06f-c2660c264652'::uuid,'Produção/Cozinha',
    (SELECT id FROM public.organizations WHERE name = 'Rancho HGUJP' LIMIT 1),
    'producao','2025-11-17 11:45:14.51073-03'),
	('8d46addb-3fc7-4036-bdfb-9bf174437a83'::uuid,'Produção/Cozinha',
    (SELECT id FROM public.organizations WHERE name = 'Rancho HMAR' LIMIT 1),
    'producao','2025-11-17 11:46:22.531208-03');
