-- Add invited_by metadata fields to invites table
ALTER TABLE IF EXISTS public.invites
  ADD COLUMN IF NOT EXISTS invited_by_name character varying(255),
  ADD COLUMN IF NOT EXISTS invited_by_email character varying(255),
  ADD COLUMN IF NOT EXISTS invited_by_avatar_url text;

