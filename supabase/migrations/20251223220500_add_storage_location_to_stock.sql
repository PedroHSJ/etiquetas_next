-- Add storage_location_id to stock and stock_movements tables

-- Add column to stock table
ALTER TABLE public.stock
ADD COLUMN IF NOT EXISTS storage_location_id UUID REFERENCES public.storage_locations(id);

-- Add column to stock_movements table
ALTER TABLE public.stock_movements
ADD COLUMN IF NOT EXISTS storage_location_id UUID REFERENCES public.storage_locations(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_storage_location ON public.stock(storage_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_storage_location ON public.stock_movements(storage_location_id);

-- Comments
COMMENT ON COLUMN public.stock.storage_location_id IS 'Physical storage location for this stock';
COMMENT ON COLUMN public.stock_movements.storage_location_id IS 'Physical storage location for this movement';
