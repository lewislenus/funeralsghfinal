-- SQL script to add missing columns to the funerals table
-- This will allow the table to store all data from the funeral creation form

-- Add missing columns to the funerals table
ALTER TABLE public.funerals 
ADD COLUMN IF NOT EXISTS funeral_time TIME,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS family_contact TEXT,
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];

-- Update existing columns that might need modification
-- Change funeral_date to include time if needed (it's already timestamp with time zone)
-- funeral_location already exists, but we also have 'location' from the form
-- You might want to decide which one to use or map them appropriately

-- Optional: Add comments to document the columns
COMMENT ON COLUMN public.funerals.funeral_time IS 'Time of the funeral service';
COMMENT ON COLUMN public.funerals.venue IS 'Venue where the funeral will be held';
COMMENT ON COLUMN public.funerals.region IS 'Region/state where the funeral is taking place';
COMMENT ON COLUMN public.funerals.location IS 'City/town where the funeral is taking place';
COMMENT ON COLUMN public.funerals.family_name IS 'Name of the family organizing the funeral';
COMMENT ON COLUMN public.funerals.family_contact IS 'Contact information for the family';
COMMENT ON COLUMN public.funerals.poster_url IS 'URL to the funeral poster image';
COMMENT ON COLUMN public.funerals.gallery_urls IS 'Array of URLs for gallery images';

-- Note: You have both 'funeral_location' and 'location' columns now
-- Consider if you want to:
-- 1. Use 'location' for city/town and 'funeral_location' for full address
-- 2. Or consolidate them into one column
-- 3. Or rename one of them for clarity

-- Add foreign key constraints to establish relationships
-- This allows us to join tables in our API queries

-- Link condolences to funerals idempotently
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'condolences_funeral_id_fkey' AND conrelid = 'public.condolences'::regclass
    ) THEN
        ALTER TABLE public.condolences
        ADD CONSTRAINT condolences_funeral_id_fkey
        FOREIGN KEY (funeral_id)
        REFERENCES public.funerals(id)
        ON DELETE CASCADE;
    END IF;
END;
$$;

-- Create the increment_funeral_views RPC function
-- This function safely increments the view count for a funeral
CREATE OR REPLACE FUNCTION increment_funeral_views(funeral_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    -- Update the view count and return the new value
    UPDATE public.funerals 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = funeral_id_param;
    
    -- Get the updated view count
    SELECT view_count INTO new_view_count
    FROM public.funerals 
    WHERE id = funeral_id_param;
    
    RETURN COALESCE(new_view_count, 0);
EXCEPTION
    WHEN OTHERS THEN
        -- Return 0 if there's any error
        RETURN 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_funeral_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_funeral_views(UUID) TO anon;

-- Link donations to funerals idempotently
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'donations_funeral_id_fkey' AND conrelid = 'public.donations'::regclass
    ) THEN
        ALTER TABLE public.donations
        ADD CONSTRAINT donations_funeral_id_fkey
        FOREIGN KEY (funeral_id)
        REFERENCES public.funerals(id)
        ON DELETE CASCADE;
    END IF;
END;
$$;

-- Create the increment_funeral_views RPC function
-- This function safely increments the view count for a funeral
CREATE OR REPLACE FUNCTION increment_funeral_views(funeral_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    -- Update the view count and return the new value
    UPDATE public.funerals 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = funeral_id_param;
    
    -- Get the updated view count
    SELECT view_count INTO new_view_count
    FROM public.funerals 
    WHERE id = funeral_id_param;
    
    RETURN COALESCE(new_view_count, 0);
EXCEPTION
    WHEN OTHERS THEN
        -- Return 0 if there's any error
        RETURN 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_funeral_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_funeral_views(UUID) TO anon;
