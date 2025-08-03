-- Tabela de etiquetas
CREATE TABLE public.labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('produto_aberto', 'manipulado', 'descongelo', 'amostra')) NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expiration_date DATE NOT NULL,
  batch_number TEXT,
  responsible TEXT,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de templates de etiquetas
CREATE TABLE public.label_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  label_type TEXT CHECK (label_type IN ('produto_aberto', 'manipulado', 'descongelo', 'amostra')) NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  layout_config JSONB NOT NULL,
  paper_size TEXT CHECK (paper_size IN ('A4', 'custom', 'label_small', 'label_medium', 'label_large')) NOT NULL DEFAULT 'A4',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de layouts de impressão
CREATE TABLE public.print_layouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  template_id UUID REFERENCES public.label_templates(id) ON DELETE CASCADE NOT NULL,
  paper_size TEXT CHECK (paper_size IN ('A4', 'custom', 'label_small', 'label_medium', 'label_large')) NOT NULL DEFAULT 'A4',
  labels_per_page INTEGER NOT NULL DEFAULT 1,
  margin_config JSONB NOT NULL,
  spacing_config JSONB NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);