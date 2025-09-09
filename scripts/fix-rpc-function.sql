-- Fix the increment_funeral_views function to handle UUID parameters correctly
-- This addresses the "invalid input syntax for type bigint" error

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.increment_funeral_views(UUID);
DROP FUNCTION IF EXISTS public.increment_funeral_views(bigint);

-- Create the function with correct UUID parameter
CREATE OR REPLACE FUNCTION public.increment_funeral_views(funeral_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    -- Validate input
    IF funeral_uuid IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Update the view count and return the new value
    UPDATE public.funerals 
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = funeral_uuid;
    
    -- Check if the update affected any rows
    IF NOT FOUND THEN
        -- Funeral doesn't exist
        RETURN 0;
    END IF;
    
    -- Get the updated view count
    SELECT views_count INTO new_view_count
    FROM public.funerals 
    WHERE id = funeral_uuid;
    
    RETURN COALESCE(new_view_count, 0);
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return 0
        RAISE WARNING 'Error incrementing funeral views for %: %', funeral_uuid, SQLERRM;
        RETURN 0;
END;
$$;

-- Grant execute permission to authenticated users and anonymous users
GRANT EXECUTE ON FUNCTION public.increment_funeral_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_funeral_views(UUID) TO anon;

-- Verify the function was created correctly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'increment_funeral_views'
        AND p.pronargs = 1
    ) THEN
        RAISE NOTICE 'Function increment_funeral_views(UUID) created successfully';
    ELSE
        RAISE EXCEPTION 'Failed to create increment_funeral_views function';
    END IF;
END;
$$;
