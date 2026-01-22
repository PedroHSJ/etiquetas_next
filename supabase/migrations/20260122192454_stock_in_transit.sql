-- =====================================================
-- MIGRATION: STOCK IN TRANSIT
-- =====================================================
-- Adds table to control fractionated food
-- labeled for later use.
-- =====================================================

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

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_stock_transit_product ON public.stock_in_transit(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transit_organization ON public.stock_in_transit(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_transit_user ON public.stock_in_transit(user_id);

-- LABELS RELATED TO STOCK IN TRANSIT
-- Add column to link a label to stock in transit if necessary
ALTER TABLE public.labels ADD COLUMN IF NOT EXISTS stock_in_transit_id UUID REFERENCES public.stock_in_transit(id) ON DELETE SET NULL;

-- RLS (ROW LEVEL SECURITY)
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

-- TRIGGER FOR UPDATED_AT
DROP TRIGGER IF EXISTS update_stock_in_transit_updated_at ON public.stock_in_transit;
CREATE TRIGGER update_stock_in_transit_updated_at
    BEFORE UPDATE ON public.stock_in_transit
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- COMMENTS
COMMENT ON TABLE public.stock_in_transit IS 'Food removed from stock, labeled and stored for later use';
COMMENT ON COLUMN public.stock_in_transit.quantity IS 'Fractionated quantity of the food';
COMMENT ON COLUMN public.stock_in_transit.manufacturing_date IS 'Manufacturing/opening date of the product';
COMMENT ON COLUMN public.stock_in_transit.expiry_date IS 'New expiry date after opening';
