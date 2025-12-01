-- =============================================================================
-- TECHNICAL SHEETS MODULE
-- =============================================================================

-- Main table: technical_sheets
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
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ingredients table
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

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_technical_sheets_org ON public.technical_sheets (organization_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheets_created_by ON public.technical_sheets (created_by);
CREATE INDEX IF NOT EXISTS idx_technical_sheet_ingredients_sheet ON public.technical_sheet_ingredients (technical_sheet_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheet_ingredients_product ON public.technical_sheet_ingredients (product_id);
CREATE INDEX IF NOT EXISTS idx_technical_sheet_ingredients_sort ON public.technical_sheet_ingredients (sort_order);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Reuse the common updated_at trigger function
CREATE TRIGGER update_technical_sheets_updated_at
    BEFORE UPDATE ON public.technical_sheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.technical_sheets IS 'Technical sheets for recipes/dishes';
COMMENT ON COLUMN public.technical_sheets.dish_name IS 'Dish or recipe name';
COMMENT ON COLUMN public.technical_sheets.servings IS 'Number of servings';
COMMENT ON COLUMN public.technical_sheets.nutritional_insights IS 'JSON with nutritional data and highlights';
COMMENT ON COLUMN public.technical_sheets.preparation_steps IS 'Array with preparation steps';
COMMENT ON TABLE public.technical_sheet_ingredients IS 'Ingredients linked to a technical sheet';
COMMENT ON COLUMN public.technical_sheet_ingredients.sort_order IS 'Order of the ingredient in the sheet';
