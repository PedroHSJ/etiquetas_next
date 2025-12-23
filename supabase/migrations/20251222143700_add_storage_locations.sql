-- Create storage_locations table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_locations_organization ON public.storage_locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_storage_locations_parent ON public.storage_locations(parent_id);

-- Trigger for updated_at
CREATE TRIGGER update_storage_locations_updated_at
    BEFORE UPDATE ON public.storage_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.storage_locations IS 'Physical storage locations (e.g., Warehouse, Aisle, Shelf)';
COMMENT ON COLUMN public.storage_locations.parent_id IS 'Self-reference for hierarchical structure';
