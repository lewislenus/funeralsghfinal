-- Fix the increment_funeral_views function parameter name mismatch
-- This ensures the function parameter matches what the TypeScript API expects

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.increment_funeral_views(UUID);

-- Recreate the function with the correct parameter name
CREATE OR REPLACE FUNCTION public.increment_funeral_views(funeral_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    -- Update the view count and return the new value
    UPDATE public.funerals 
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = funeral_uuid;
    
    -- Get the updated view count
    SELECT views_count INTO new_view_count
    FROM public.funerals 
    WHERE id = funeral_uuid;
    
    RETURN COALESCE(new_view_count, 0);
EXCEPTION
    WHEN OTHERS THEN
        -- Return 0 if there's any error
        RETURN 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_funeral_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_funeral_views(UUID) TO anon;

-- Verify the function exists and has correct signature
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
