-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de organizações
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de departamentos
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários (estende auth.users do Supabase)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias de produtos
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Cor hex para identificação visual
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Tabela de produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  brand VARCHAR(255),
  supplier VARCHAR(255),
  barcode VARCHAR(50),
  internal_code VARCHAR(50),
  shelf_life_days INTEGER, -- Validade em dias
  storage_temperature VARCHAR(50), -- Ex: "2-4°C", "-18°C"
  allergens TEXT[], -- Array de alérgenos
  ingredients TEXT[], -- Lista de ingredientes
  nutritional_info JSONB DEFAULT '{}', -- Informações nutricionais
  haccp_notes TEXT, -- Notas específicas de HACCP
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de templates de etiquetas
CREATE TABLE label_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  label_type VARCHAR(50) NOT NULL CHECK (label_type IN ('PRODUTO_ABERTO', 'MANIPULADO', 'DESCONGELO', 'AMOSTRA', 'BRANCO')),
  paper_size VARCHAR(20) DEFAULT 'A4' CHECK (paper_size IN ('A4', 'CUSTOM')),
  custom_width INTEGER,
  custom_height INTEGER,
  labels_per_row INTEGER DEFAULT 1,
  labels_per_column INTEGER DEFAULT 1,
  label_width INTEGER NOT NULL,
  label_height INTEGER NOT NULL,
  margin_top INTEGER DEFAULT 20,
  margin_bottom INTEGER DEFAULT 20,
  margin_left INTEGER DEFAULT 20,
  margin_right INTEGER DEFAULT 20,
  gap_horizontal INTEGER DEFAULT 10,
  gap_vertical INTEGER DEFAULT 10,
  fields JSONB NOT NULL DEFAULT '[]', -- Array de campos do template
  is_default BOOLEAN DEFAULT false, -- Template padrão para o tipo
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de etiquetas geradas
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  template_id UUID NOT NULL REFERENCES label_templates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  label_type VARCHAR(50) NOT NULL CHECK (label_type IN ('PRODUTO_ABERTO', 'MANIPULADO', 'DESCONGELO', 'AMOSTRA', 'BRANCO')),
  
  -- Dados do produto (podem ser diferentes do cadastro original)
  product_name VARCHAR(255),
  product_brand VARCHAR(255),
  quantity DECIMAL(10,3),
  unit_of_measure VARCHAR(10),
  
  -- Dados específicos por tipo de etiqueta
  responsible VARCHAR(255), -- Responsável pela manipulação
  opening_date DATE, -- Para produto aberto
  manipulation_date DATE, -- Para produto manipulado
  thaw_date DATE, -- Para descongelamento
  sample_date DATE, -- Para amostra
  expiry_date DATE, -- Data de validade calculada
  
  -- Dados adicionais
  temperature VARCHAR(50),
  lot VARCHAR(100),
  batch VARCHAR(100),
  notes TEXT,
  
  -- Campos customizáveis em JSON
  custom_fields JSONB DEFAULT '{}',
  
  -- Rastreabilidade
  printed_at TIMESTAMP WITH TIME ZONE,
  print_count INTEGER DEFAULT 0,
  qr_code VARCHAR(255), -- Código QR único para rastreamento
  
  created_by UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de impressões
CREATE TABLE label_prints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  printed_by UUID NOT NULL REFERENCES user_profiles(id),
  quantity_printed INTEGER NOT NULL DEFAULT 1,
  printer_name VARCHAR(255),
  print_settings JSONB DEFAULT '{}',
  printed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_products_organization ON products(organization_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_internal_code ON products(internal_code);
CREATE INDEX idx_labels_organization ON labels(organization_id);
CREATE INDEX idx_labels_product ON labels(product_id);
CREATE INDEX idx_labels_template ON labels(template_id);
CREATE INDEX idx_labels_type ON labels(label_type);
CREATE INDEX idx_labels_expiry ON labels(expiry_date);
CREATE INDEX idx_labels_created ON labels(created_at);
CREATE INDEX idx_label_templates_organization ON label_templates(organization_id);
CREATE INDEX idx_label_templates_type ON label_templates(label_type);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_label_templates_updated_at BEFORE UPDATE ON label_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labels_updated_at BEFORE UPDATE ON labels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_prints ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuários só veem dados da sua organização)
CREATE POLICY "Users can view their organization's data" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's departments" ON departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's products" ON products
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's product categories" ON product_categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's label templates" ON label_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their organization's labels" ON labels
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

-- Políticas de inserção/atualização (admins e managers podem modificar)
CREATE POLICY "Admins and managers can insert products" ON products
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update products" ON products
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Permitir que todos os usuários criem etiquetas
CREATE POLICY "Users can create labels" ON labels
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their labels" ON labels
  FOR UPDATE USING (
    created_by = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
