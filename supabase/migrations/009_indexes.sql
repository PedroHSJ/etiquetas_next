-- 009_indexes.sql
-- Auxiliary indexes
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states (code);
CREATE INDEX IF NOT EXISTS idx_cities_ibge_code ON public.cities (ibge_code);
CREATE INDEX IF NOT EXISTS idx_cities_state ON public.cities (state_id);
CREATE INDEX IF NOT EXISTS idx_cities_name ON public.cities (name);
