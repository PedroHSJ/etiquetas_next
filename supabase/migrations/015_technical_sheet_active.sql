-- Add active flag to technical_sheets for soft delete support
ALTER TABLE public.technical_sheets
ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.technical_sheets.active IS 'Indicates if the technical sheet is active (soft delete flag)';

-- Ensure existing rows are marked active
UPDATE public.technical_sheets SET active = true WHERE active IS NULL;
