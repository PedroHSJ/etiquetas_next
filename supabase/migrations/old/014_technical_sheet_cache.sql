-- =============================================================================
-- TECHNICAL SHEET AI CACHE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.technical_sheet_ai_cache (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    dish_name text NOT NULL,
    servings integer NOT NULL CHECK (servings > 0),
    json_response jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT technical_sheet_ai_cache_unique UNIQUE (dish_name, servings)
);

COMMENT ON TABLE public.technical_sheet_ai_cache IS 'Caches AI-generated technical sheets to avoid repeated requests';
COMMENT ON COLUMN public.technical_sheet_ai_cache.dish_name IS 'Dish name used in the AI prompt';
COMMENT ON COLUMN public.technical_sheet_ai_cache.servings IS 'Servings used in the AI prompt';
COMMENT ON COLUMN public.technical_sheet_ai_cache.json_response IS 'Full JSON returned by the AI provider';
