-- Add visibility column to funerals table for hide/show functionality
-- This allows admins to hide funerals from public view without deleting them

ALTER TABLE public.funerals 
ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;

-- Create index for better performance when filtering by visibility
CREATE INDEX idx_funerals_visibility ON public.funerals(is_visible);

-- Update the RLS policy for public funeral viewing to include visibility check
DROP POLICY IF EXISTS "Anyone can view approved funerals" ON public.funerals;

CREATE POLICY "Anyone can view approved and visible funerals" ON public.funerals
    FOR SELECT USING (status = 'approved' AND is_visible = TRUE);

-- Add comment for documentation
COMMENT ON COLUMN public.funerals.is_visible IS 'Controls whether the funeral is visible to the public. Admins can hide funerals without deleting them.';

-- Update any existing funerals to be visible by default (if any exist)
UPDATE public.funerals SET is_visible = TRUE WHERE is_visible IS NULL;