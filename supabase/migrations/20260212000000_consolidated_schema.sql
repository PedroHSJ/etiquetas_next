-- =============================================================================
-- CONSOLIDATED DATABASE SCHEMA
-- Generated on: 2026-02-12
-- This file merges all previous migrations into a single initial state.
-- =============================================================================

-- 1. EXTENSIONS & SCHEMAS
CREATE SCHEMA IF NOT EXISTS "extensions";
CREATE SCHEMA IF NOT EXISTS "graphql";
CREATE SCHEMA IF NOT EXISTS "vault";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- 2. SEQUENCES
CREATE SEQUENCE IF NOT EXISTS public.states_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.cities_id_seq AS integer START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS public.labels_id_seq AS integer START WITH 1 INCREMENT BY 1;

-- 3. CUSTOM ENUMS/TYPES
DO $$ BEGIN
    CREATE TYPE public.label_type AS ENUM (
        'manipulado',
        'descongelo',
        'amostra',
        'produto_aberto'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. CORE TABLES
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL,
    type character varying(100),
    cnpj character varying(14),
    capacity integer,
    opening_date date,
    full_address text,
    zip_code character varying(9),
    district character varying(100),
    address character varying(255),
    number character varying(20),
    address_complement character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    main_phone character varying(15),
    alt_phone character varying(15),
    institutional_email character varying(255),
    state_id integer,
    city_id integer,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    department_type character varying(100),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technical_responsibles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    responsible_type character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    document character varying(20),
    phone character varying(15),
    email character varying(255),
    notes text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. AUXILIARY TABLES (DOMAIN)
CREATE TABLE IF NOT EXISTS public.states (
    id integer NOT NULL DEFAULT nextval('public.states_id_seq'::regclass) PRIMARY KEY,
    code character varying(2) NOT NULL UNIQUE,
    name character varying(100) NOT NULL,
    region character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
    id integer NOT NULL DEFAULT nextval('public.cities_id_seq'::regclass) PRIMARY KEY,
    state_id integer NOT NULL REFERENCES public.states(id),
    ibge_code character varying(10) UNIQUE,
    name character varying(150) NOT NULL,
    zip_code_start character varying(8),
    zip_code_end character varying(8),
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.organizations
    ADD CONSTRAINT organizations_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.states(id),
    ADD CONSTRAINT organizations_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);

CREATE TABLE IF NOT EXISTS public.functionalities (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL UNIQUE,
    description text,
    code character varying(100) NOT NULL UNIQUE,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name character varying(255) NOT NULL UNIQUE,
    description text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    functionality_id uuid NOT NULL REFERENCES public.functionalities(id),
    profile_id uuid NOT NULL REFERENCES public.profiles(id),
    action character varying(100),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    profile_id uuid NOT NULL REFERENCES public.profiles(id),
    active boolean DEFAULT true,
    entry_date timestamp with time zone DEFAULT now(),
    exit_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_organization_id uuid NOT NULL REFERENCES public.user_organizations(id),
    profile_id uuid NOT NULL REFERENCES public.profiles(id),
    active boolean DEFAULT true,
    start_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 6. PRODUCTS & INVENTORY
CREATE TABLE IF NOT EXISTS public.groups (
    id integer NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text
);

CREATE TABLE IF NOT EXISTS public.products (
    id integer NOT NULL PRIMARY KEY,
    name text NOT NULL,
    group_id integer REFERENCES public.groups(id)
);

CREATE TABLE IF NOT EXISTS public.unit_of_measure (
    code character varying(10) PRIMARY KEY,
    description character varying(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.storage_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES public.storage_locations(id),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stock (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "productId" integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    unit_of_measure_code character varying(10) DEFAULT 'un' NOT NULL REFERENCES public.unit_of_measure(code),
    storage_location_id UUID REFERENCES public.storage_locations(id),
    current_quantity numeric(10,3) DEFAULT 0 NOT NULL,
    "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "stock_productId_unique" UNIQUE ("productId"),
    CONSTRAINT "stock_current_quantity_check" CHECK ("current_quantity" >= 0)
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "productId" integer NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
    "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    storage_location_id UUID REFERENCES public.storage_locations(id),
    movement_type text NOT NULL CHECK (movement_type IN ('ENTRADA', 'SAIDA')),
    quantity numeric(10,3) NOT NULL CHECK (quantity > 0),
    unit_of_measure_code character varying(10) DEFAULT 'un' NOT NULL REFERENCES public.unit_of_measure(code),
    observation text,
    movement_date timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.labels (
    id integer DEFAULT nextval('public.labels_id_seq'::regclass) NOT NULL PRIMARY KEY,
    product_id integer REFERENCES public.products(id),
    quantity integer DEFAULT 1,
    printed_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    organization_id uuid REFERENCES public.organizations(id),
    status character varying(100) DEFAULT 'printed',
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stock_in_transit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL REFERENCES public.products(id),
    quantity NUMERIC(15,3) NOT NULL,
    unit_of_measure_code VARCHAR(10) NOT NULL REFERENCES public.unit_of_measure(code),
    manufacturing_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.labels ADD COLUMN IF NOT EXISTS stock_in_transit_id UUID REFERENCES public.stock_in_transit(id) ON DELETE SET NULL;

-- 7. INVITES
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email character varying(255) NOT NULL,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    profile_id uuid NOT NULL REFERENCES public.profiles(id),
    status character varying(50) DEFAULT 'pending',
    invite_token character varying(255) NOT NULL UNIQUE,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    invited_by uuid NOT NULL REFERENCES auth.users(id),
    invited_by_name character varying(255),
    invited_by_email character varying(255),
    invited_by_avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone,
    accepted_by uuid REFERENCES auth.users(id),
    rejected_at timestamp with time zone,
    rejected_by uuid REFERENCES auth.users(id)
);

-- 8. TECHNICAL SHEETS
CREATE TABLE IF NOT EXISTS public.technical_sheets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dish_name text NOT NULL,
    servings integer NOT NULL CHECK (servings > 0),
    preparation_time text,
    cooking_time text,
    difficulty text,
    preparation_steps text[],
    nutritional_insights jsonb,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES auth.users(id),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technical_sheet_ingredients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    technical_sheet_id uuid NOT NULL REFERENCES public.technical_sheets(id) ON DELETE CASCADE,
    ingredient_name text NOT NULL,
    quantity text NOT NULL,
    unit text NOT NULL,
    original_quantity text NOT NULL,
    product_id integer REFERENCES public.products(id),
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technical_sheet_ai_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dish_name text NOT NULL,
    servings integer NOT NULL CHECK (servings > 0),
    json_response jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT technical_sheet_ai_cache_unique UNIQUE (dish_name, servings)
);

-- 9. FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_or_create_city(
    p_name character varying,
    p_state_code character varying,
    p_ibge_code character varying DEFAULT NULL,
    p_zip_code character varying DEFAULT NULL,
    p_latitude numeric DEFAULT NULL,
    p_longitude numeric DEFAULT NULL
) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_state_id INTEGER;
    v_city_id INTEGER;
    v_result JSON;
BEGIN
    SELECT id INTO v_state_id FROM public.states WHERE code = p_state_code;
    IF v_state_id IS NULL THEN
        RAISE EXCEPTION 'State not found: %', p_state_code;
    END IF;
    SELECT id INTO v_city_id FROM public.cities WHERE state_id = v_state_id AND name = p_name;
    IF v_city_id IS NULL THEN
        INSERT INTO public.cities (state_id, name, ibge_code, zip_code_start, latitude, longitude)
        VALUES (v_state_id, p_name, p_ibge_code, p_zip_code, p_latitude, p_longitude)
        RETURNING id INTO v_city_id;
    ELSE
        UPDATE public.cities SET
            ibge_code = COALESCE(p_ibge_code, ibge_code),
            zip_code_start = COALESCE(p_zip_code, zip_code_start),
            latitude = COALESCE(p_latitude, latitude),
            longitude = COALESCE(p_longitude, longitude),
            updated_at = NOW()
        WHERE id = v_city_id;
    END IF;
    SELECT json_build_object(
        'id', c.id,
        'name', c.name,
        'state', json_build_object(
            'id', s.id,
            'code', s.code,
            'name', s.name
        )
    ) INTO v_result
    FROM public.cities c
    JOIN public.states s ON s.id = c.state_id
    WHERE c.id = v_city_id;
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_multiple_users_data(user_ids uuid[]) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  users_data JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', au.id,
      'email', au.email,
      'name', COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1),
        'User'
      ),
      'avatar_url', COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture'
      ),
      'picture', COALESCE(
        au.raw_user_meta_data->>'picture',
        au.raw_user_meta_data->>'avatar_url'
      )
    )
  ) INTO users_data
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
  RETURN COALESCE(users_data, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_data_json(user_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_data JSON;
BEGIN
  SELECT json_build_object(
    'id', au.id,
    'email', au.email,
    'name', COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1),
      'User'
    )
  ) INTO user_data
  FROM auth.users au
  WHERE au.id = user_id;
  RETURN COALESCE(user_data, '{"name": "User", "email": ""}'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_info(user_id uuid) RETURNS TABLE(id uuid, email character varying, name text, picture text, avatar_url text)
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1)
    ) as name,
    COALESCE(
      u.raw_user_meta_data->>'picture',
      u.raw_user_meta_data->>'avatar_url'
    ) as picture,
    COALESCE(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ) as avatar_url
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION process_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    v_current_quantity NUMERIC;
    v_new_quantity NUMERIC;
    v_current_unit character varying(10);
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT current_quantity, unit_of_measure_code
        INTO v_current_quantity, v_current_unit
        FROM public.stock 
        WHERE "productId" = NEW."productId"
          AND organization_id = NEW.organization_id;
        
        IF v_current_quantity IS NULL THEN
            IF NEW.movement_type = 'ENTRADA' THEN
                v_new_quantity := NEW.quantity;
            ELSE
                RAISE EXCEPTION 'Cannot perform exit without prior stock for product ID: % and organization: %', NEW."productId", NEW.organization_id;
            END IF;
            
            INSERT INTO public.stock ("productId", current_quantity, unit_of_measure_code, "userId", organization_id, storage_location_id)
            VALUES (NEW."productId", v_new_quantity, NEW.unit_of_measure_code, NEW."userId", NEW.organization_id, NEW.storage_location_id);
        ELSE
            IF v_current_unit IS NOT NULL AND v_current_unit <> NEW.unit_of_measure_code THEN
                RAISE EXCEPTION 'Unit mismatch for product ID %, expected %, received %', NEW."productId", v_current_unit, NEW.unit_of_measure_code;
            END IF;
            IF NEW.movement_type = 'ENTRADA' THEN
                v_new_quantity := v_current_quantity + NEW.quantity;
            ELSE -- SAIDA
                v_new_quantity := v_current_quantity - NEW.quantity;
                IF v_new_quantity < 0 THEN
                    RAISE EXCEPTION 'Insufficient quantity in stock. Available: %, Requested: %', v_current_quantity, NEW.quantity;
                END IF;
            END IF;
            
            UPDATE public.stock 
            SET current_quantity = v_new_quantity,
                unit_of_measure_code = COALESCE(v_current_unit, NEW.unit_of_measure_code),
                "userId" = NEW."userId",
                organization_id = NEW.organization_id,
                storage_location_id = COALESCE(NEW.storage_location_id, public.stock.storage_location_id),
                updated_at = now()
            WHERE "productId" = NEW."productId"
              AND organization_id = NEW.organization_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE OR REPLACE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_technical_responsibles_updated_at BEFORE UPDATE ON public.technical_responsibles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_cities_updated_at BEFORE UPDATE ON public.cities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_storage_locations_updated_at BEFORE UPDATE ON public.storage_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER trigger_process_stock_movement AFTER INSERT ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION process_stock_movement();
CREATE OR REPLACE TRIGGER update_technical_sheets_updated_at BEFORE UPDATE ON public.technical_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_stock_in_transit_updated_at BEFORE UPDATE ON public.stock_in_transit FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states (code);
CREATE INDEX IF NOT EXISTS idx_cities_ibge_code ON public.cities (ibge_code);
CREATE INDEX IF NOT EXISTS idx_cities_state ON public.cities (state_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities (name);
CREATE INDEX IF NOT EXISTS idx_storage_locations_organization ON public.storage_locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_parent ON public.storage_locations(parent_id);
CREATE INDEX IF NOT EXISTS "idx_stock_productId" ON "public"."stock" ("productId");
CREATE INDEX IF NOT EXISTS "idx_stock_userId" ON "public"."stock" ("userId");
CREATE INDEX IF NOT EXISTS "idx_stock_organization_id" ON "public"."stock" ("organization_id");
CREATE INDEX IF NOT EXISTS idx_stock_storage_location ON public.stock(storage_location_id);
CREATE INDEX IF NOT EXISTS "idx_stock_movements_productId" ON "public"."stock_movements" ("productId");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_userId" ON "public"."stock_movements" ("userId");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_organization_id" ON "public"."stock_movements" ("organization_id");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_date" ON "public"."stock_movements" ("movement_date");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_type" ON "public"."stock_movements" ("movement_type");
CREATE INDEX IF NOT EXISTS idx_stock_movements_storage_location ON public.stock_movements(storage_location_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheets_org ON public.technical_sheets (organization_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheets_created_by ON public.technical_sheets (created_by);
CREATE INDEX IF NOT EXISTS idx_technical_sheet_ingredients_sheet ON public.technical_sheet_ingredients (technical_sheet_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheet_ingredients_product ON public.technical_sheet_ingredients (product_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheet_ingredients_sort ON public.technical_sheet_ingredients (sort_order);
CREATE INDEX IF NOT EXISTS idx_stock_transit_product ON public.stock_in_transit(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transit_organization ON public.stock_in_transit(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_transit_user ON public.stock_in_transit(user_id);

-- 11. RLS POLICIES
ALTER TABLE public.stock_in_transit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stock in transit from their organizations" ON public.stock_in_transit
    FOR SELECT USING (
        organization_id IN (
            SELECT o.organization_id 
            FROM public.user_organizations o
            WHERE o.user_id = auth.uid() AND o.active = true
        )
    );

CREATE POLICY "Users can insert stock in transit into their organizations" ON public.stock_in_transit
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT o.organization_id 
            FROM public.user_organizations o
            WHERE o.user_id = auth.uid() AND o.active = true
        )
    );

CREATE POLICY "Users can update stock in transit from their organizations" ON public.stock_in_transit
    FOR UPDATE USING (
        organization_id IN (
            SELECT o.organization_id 
            FROM public.user_organizations o
            WHERE o.user_id = auth.uid() AND o.active = true
        )
    );

CREATE POLICY "Users can delete stock in transit from their organizations" ON public.stock_in_transit
    FOR DELETE USING (
        organization_id IN (
            SELECT o.organization_id 
            FROM public.user_organizations o
            WHERE o.user_id = auth.uid() AND o.active = true
        )
    );

-- 12. COMMENTS
COMMENT ON TABLE public.organizations IS 'Tabela de organizações/empresas que usam o sistema';
COMMENT ON TABLE public.departments IS 'Departamentos dentro de cada organização';
COMMENT ON TABLE public.storage_locations IS 'Physical storage locations (e.g., Warehouse, Aisle, Shelf)';
COMMENT ON TABLE public.stock IS 'Current product stock';
COMMENT ON TABLE public.stock_movements IS 'Stock movement history';
COMMENT ON TABLE public.technical_sheets IS 'Technical sheets for recipes/dishes';
COMMENT ON TABLE public.technical_sheet_ingredients IS 'Ingredients linked to a technical sheet';
COMMENT ON TABLE public.technical_sheet_ai_cache IS 'Caches AI-generated technical sheets to avoid repeated requests';
COMMENT ON TABLE public.stock_in_transit IS 'Food removed from stock, labeled and stored for later use';
