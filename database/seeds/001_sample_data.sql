-- Dados de exemplo para desenvolvimento e testes

-- Organização de exemplo
INSERT INTO organizations (id, name, slug, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Restaurante Exemplo', 'restaurante-exemplo', 'Restaurante para demonstração do sistema');

-- Departamentos de exemplo
INSERT INTO departments (id, organization_id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Cozinha', 'Área de preparo dos alimentos'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Padaria', 'Seção de panificação'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Açougue', 'Seção de carnes');

-- Categorias de produtos
INSERT INTO product_categories (id, organization_id, name, description, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Proteínas', 'Carnes, peixes, ovos e derivados', '#ef4444'),
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Laticínios', 'Leite, queijos, iogurtes', '#3b82f6'),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Vegetais', 'Verduras, legumes e frutas', '#22c55e'),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Grãos e Cereais', 'Arroz, feijão, trigo', '#f59e0b'),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Temperos', 'Especiarias e condimentos', '#8b5cf6'),
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', 'Bebidas', 'Sucos, refrigerantes, água', '#06b6d4'),
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', 'Padaria', 'Pães, massas, bolos', '#f97316'),
  ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', 'Congelados', 'Produtos congelados', '#0ea5e9');

-- Produtos de exemplo
INSERT INTO products (
  id, organization_id, category_id, name, description,
  brand, shelf_life_days, storage_temperature, allergens, ingredients,
  nutritional_info, created_by
) VALUES
  -- Proteínas
  ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010',
   'Peito de Frango', 'Peito de frango sem osso e sem pele',
   'Aviário São Paulo', 3, '2-4°C', '{}', '{"Peito de frango"}',
   '{"calories_per_100g": 165, "protein_per_100g": 31, "carbs_per_100g": 0, "fat_per_100g": 3.6, "fiber_per_100g": 0, "sodium_per_100g": 74}',
   (SELECT id FROM user_profiles LIMIT 1)),

  ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010',
   'Carne Bovina Moída', 'Carne bovina moída primeira qualidade',
   'Frigorífico Central', 2, '2-4°C', '{}', '{"Carne bovina"}',
   '{"calories_per_100g": 250, "protein_per_100g": 26, "carbs_per_100g": 0, "fat_per_100g": 15, "fiber_per_100g": 0, "sodium_per_100g": 75}',
   (SELECT id FROM user_profiles LIMIT 1)),

  ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440010',
   'Salmão Fresco', 'Filé de salmão fresco',
   'Pescados Atlântico', 2, '0-2°C', '{"Peixe"}', '{"Salmão"}',
   '{"calories_per_100g": 208, "protein_per_100g": 25, "carbs_per_100g": 0, "fat_per_100g": 12, "fiber_per_100g": 0, "sodium_per_100g": 59}',
   (SELECT id FROM user_profiles LIMIT 1)),

  -- Laticínios
  ('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011',
   'Leite Integral', 'Leite integral UHT',
   'Leiteria Vale Verde', 7, '2-8°C', '{"Leite"}', '{"Leite integral"}',
   '{"calories_per_100g": 61, "protein_per_100g": 3.2, "carbs_per_100g": 4.8, "fat_per_100g": 3.3, "fiber_per_100g": 0, "sodium_per_100g": 44}',
   (SELECT id FROM user_profiles LIMIT 1)),

  ('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011',
   'Queijo Mussarela', 'Queijo mussarela fatiado',
   'Queijaria Artesanal', 15, '2-8°C', '{"Leite"}', '{"Leite", "Coalho", "Sal"}',
   '{"calories_per_100g": 280, "protein_per_100g": 28, "carbs_per_100g": 3, "fat_per_100g": 17, "fiber_per_100g": 0, "sodium_per_100g": 627}',
   (SELECT id FROM user_profiles LIMIT 1)),

  -- Vegetais
  ('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012',
   'Alface Americana', 'Alface americana hidropônica',
   'Hortifruti Orgânico', 5, '2-8°C', '{}', '{"Alface"}',
   '{"calories_per_100g": 15, "protein_per_100g": 1.4, "carbs_per_100g": 2.9, "fat_per_100g": 0.1, "fiber_per_100g": 1.3, "sodium_per_100g": 28}',
   (SELECT id FROM user_profiles LIMIT 1)),

  ('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012',
   'Tomate Italiano', 'Tomate italiano para molhos',
   'Sítio das Hortaliças', 7, 'Ambiente', '{}', '{"Tomate"}',
   '{"calories_per_100g": 18, "protein_per_100g": 0.9, "carbs_per_100g": 3.9, "fat_per_100g": 0.2, "fiber_per_100g": 1.2, "sodium_per_100g": 5}',
   (SELECT id FROM user_profiles LIMIT 1)),

  -- Grãos
  ('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013',
   'Arroz Branco', 'Arroz branco tipo 1',
   'Cereais do Sul', 365, 'Ambiente', '{}', '{"Arroz"}',
   '{"calories_per_100g": 130, "protein_per_100g": 2.7, "carbs_per_100g": 28, "fat_per_100g": 0.3, "fiber_per_100g": 0.4, "sodium_per_100g": 5}',
   (SELECT id FROM user_profiles LIMIT 1)),

  ('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013',
   'Feijão Preto', 'Feijão preto especial',
   'Grãos Especiais', 365, 'Ambiente', '{}', '{"Feijão preto"}',
   '{"calories_per_100g": 77, "protein_per_100g": 4.5, "carbs_per_100g": 14, "fat_per_100g": 0.5, "fiber_per_100g": 8.7, "sodium_per_100g": 2}',
   (SELECT id FROM user_profiles LIMIT 1)),

  -- Temperos
  ('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440014',
   'Sal Refinado', 'Sal refinado iodado',
   'Sal Marinho', 1825, 'Ambiente', '{}', '{"Sal", "Iodo"}',
   '{"calories_per_100g": 0, "protein_per_100g": 0, "carbs_per_100g": 0, "fat_per_100g": 0, "fiber_per_100g": 0, "sodium_per_100g": 38758}',
   (SELECT id FROM user_profiles LIMIT 1)),

  -- Bebidas
  ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440015',
   'Água Mineral', 'Água mineral natural',
   'Fonte Cristalina', 365, 'Ambiente', '{}', '{"Água mineral"}',
   '{"calories_per_100g": 0, "protein_per_100g": 0, "carbs_per_100g": 0, "fat_per_100g": 0, "fiber_per_100g": 0, "sodium_per_100g": 1}',
   (SELECT id FROM user_profiles LIMIT 1));

-- Templates de etiquetas padrão
INSERT INTO label_templates (
  id, organization_id, name, label_type, labels_per_row, labels_per_column,
  label_width, label_height, fields, is_default, created_by
) VALUES
  -- Template para Produto Aberto
  ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000',
   'Template Padrão - Produto Aberto', 'PRODUTO_ABERTO', 2, 4, 250, 150,
   '[
     {"id": "field_1", "type": "label-type", "label": "Tipo da Etiqueta", "position": {"x": 10, "y": 10}, "size": {"width": 230, "height": 25}, "style": {"fontSize": 12, "fontWeight": "bold", "textAlign": "center", "color": "#ffffff", "backgroundColor": "#ef4444"}},
     {"id": "field_2", "type": "product", "label": "Produto", "position": {"x": 10, "y": 45}, "size": {"width": 230, "height": 20}, "style": {"fontSize": 11, "fontWeight": "bold", "textAlign": "left", "color": "#000000"}},
     {"id": "field_3", "type": "date", "label": "Data de Abertura", "position": {"x": 10, "y": 70}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_4", "type": "date", "label": "Validade", "position": {"x": 130, "y": 70}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_5", "type": "text", "label": "Responsável", "position": {"x": 10, "y": 95}, "size": {"width": 230, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_6", "type": "temperature", "label": "Temperatura", "position": {"x": 10, "y": 120}, "size": {"width": 100, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_7", "type": "qrcode", "label": "QR Code", "position": {"x": 190, "y": 95}, "size": {"width": 50, "height": 50}, "style": {"fontSize": 8, "fontWeight": "normal", "textAlign": "center", "color": "#000000"}}
   ]'::jsonb,
   true, (SELECT id FROM user_profiles LIMIT 1)),

  -- Template para Manipulado
  ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000',
   'Template Padrão - Manipulado', 'MANIPULADO', 2, 4, 250, 150,
   '[
     {"id": "field_1", "type": "label-type", "label": "Tipo da Etiqueta", "position": {"x": 10, "y": 10}, "size": {"width": 230, "height": 25}, "style": {"fontSize": 12, "fontWeight": "bold", "textAlign": "center", "color": "#ffffff", "backgroundColor": "#f59e0b"}},
     {"id": "field_2", "type": "product", "label": "Produto", "position": {"x": 10, "y": 45}, "size": {"width": 230, "height": 20}, "style": {"fontSize": 11, "fontWeight": "bold", "textAlign": "left", "color": "#000000"}},
     {"id": "field_3", "type": "quantity", "label": "Quantidade", "position": {"x": 10, "y": 70}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_4", "type": "date", "label": "Data de Manipulação", "position": {"x": 130, "y": 70}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_5", "type": "date", "label": "Validade", "position": {"x": 10, "y": 95}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_6", "type": "text", "label": "Responsável", "position": {"x": 130, "y": 95}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_7", "type": "temperature", "label": "Temperatura", "position": {"x": 10, "y": 120}, "size": {"width": 100, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}}
   ]'::jsonb,
   true, (SELECT id FROM user_profiles LIMIT 1)),

  -- Template para Descongelo
  ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000',
   'Template Padrão - Descongelo', 'DESCONGELO', 2, 4, 250, 150,
   '[
     {"id": "field_1", "type": "label-type", "label": "Tipo da Etiqueta", "position": {"x": 10, "y": 10}, "size": {"width": 230, "height": 25}, "style": {"fontSize": 12, "fontWeight": "bold", "textAlign": "center", "color": "#ffffff", "backgroundColor": "#3b82f6"}},
     {"id": "field_2", "type": "product", "label": "Produto", "position": {"x": 10, "y": 45}, "size": {"width": 230, "height": 20}, "style": {"fontSize": 11, "fontWeight": "bold", "textAlign": "left", "color": "#000000"}},
     {"id": "field_3", "type": "date", "label": "Data de Descongelo", "position": {"x": 10, "y": 70}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_4", "type": "date", "label": "Validade", "position": {"x": 130, "y": 70}, "size": {"width": 110, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_5", "type": "text", "label": "Responsável", "position": {"x": 10, "y": 95}, "size": {"width": 230, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}},
     {"id": "field_6", "type": "temperature", "label": "Temperatura", "position": {"x": 10, "y": 120}, "size": {"width": 100, "height": 18}, "style": {"fontSize": 10, "fontWeight": "normal", "textAlign": "left", "color": "#000000"}}
   ]'::jsonb,
   true, (SELECT id FROM user_profiles LIMIT 1));

-- Algumas etiquetas de exemplo
INSERT INTO labels (
  id, organization_id, template_id, product_id, label_type,
  product_name, quantity, unit_of_measure, responsible,
  opening_date, expiry_date, temperature, created_by
) VALUES
  ('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000',
   '550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020',
   'PRODUTO_ABERTO', 'Peito de Frango', 2.5, 'kg', 'João Silva',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', '2-4°C',
   (SELECT id FROM user_profiles LIMIT 1)),

  ('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000',
   '550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440025',
   'MANIPULADO', 'Salada de Alface', 1.0, 'kg', 'Maria Santos',
   CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', '2-4°C',
   (SELECT id FROM user_profiles LIMIT 1));
