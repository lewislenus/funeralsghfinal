-- COMPREHENSIVE FIX FOR BIGINT/UUID TYPE MISMATCH
-- Run this script in your Supabase SQL Editor to fix the "invalid input syntax for type bigint" error

-- Step 1: Check current table structure
DO $$
DECLARE
    funerals_id_type TEXT;
    condolences_id_type TEXT;
    donations_id_type TEXT;
    profiles_id_type TEXT;
    table_count INTEGER;
BEGIN
    -- Check if tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('funerals', 'condolences', 'donations', 'profiles');
    
    IF table_count = 0 THEN
        RAISE EXCEPTION 'No tables found. Please create tables first using 001-create-tables.sql';
    END IF;
    
    -- Check current data types
    SELECT data_type INTO funerals_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'funerals' AND column_name = 'id' AND table_schema = 'public';
    
    SELECT data_type INTO condolences_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'condolences' AND column_name = 'id' AND table_schema = 'public';
    
    SELECT data_type INTO donations_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'donations' AND column_name = 'id' AND table_schema = 'public';
    
    SELECT data_type INTO profiles_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id' AND table_schema = 'public';
    
    RAISE NOTICE '=== CURRENT DATABASE SCHEMA ===';
    RAISE NOTICE 'funerals.id: %', COALESCE(funerals_id_type, 'NOT FOUND');
    RAISE NOTICE 'condolences.id: %', COALESCE(condolences_id_type, 'NOT FOUND');
    RAISE NOTICE 'donations.id: %', COALESCE(donations_id_type, 'NOT FOUND');
    RAISE NOTICE 'profiles.id: %', COALESCE(profiles_id_type, 'NOT FOUND');
END;
$$;

-- Step 2: Fix ID types if they are bigint instead of uuid
DO $$
DECLARE
    funerals_id_type TEXT;
    has_data BOOLEAN := FALSE;
    record_count INTEGER;
BEGIN
    SELECT data_type INTO funerals_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'funerals' AND column_name = 'id' AND table_schema = 'public';
    
    -- Check if tables have data
    SELECT COUNT(*) INTO record_count FROM public.funerals;
    IF record_count > 0 THEN
        has_data := TRUE;
    END IF;
    
    IF funerals_id_type = 'bigint' THEN
        RAISE NOTICE '=== CONVERTING BIGINT IDs TO UUID ===';
        
        IF has_data THEN
            RAISE WARNING 'Tables contain data. This conversion will generate new UUIDs and break existing relationships!';
            RAISE WARNING 'Consider backing up your data first.';
        END IF;
        
        -- Drop foreign key constraints
        ALTER TABLE IF EXISTS public.condolences DROP CONSTRAINT IF EXISTS condolences_funeral_id_fkey;
        ALTER TABLE IF EXISTS public.donations DROP CONSTRAINT IF EXISTS donations_funeral_id_fkey;
        
        -- Convert all ID columns to UUID
        ALTER TABLE public.funerals 
        ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        ALTER TABLE public.funerals 
        ALTER COLUMN organizer_id TYPE UUID USING gen_random_uuid();
        
        -- Convert other tables if they exist and have bigint IDs
        DO $inner$
        DECLARE
            condolences_exists BOOLEAN;
            donations_exists BOOLEAN;
        BEGIN
            SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'condolences' AND table_schema = 'public') INTO condolences_exists;
            SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'donations' AND table_schema = 'public') INTO donations_exists;
            
            IF condolences_exists THEN
                ALTER TABLE public.condolences 
                ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
                ALTER COLUMN id SET DEFAULT gen_random_uuid(),
                ALTER COLUMN funeral_id TYPE UUID USING gen_random_uuid();
            END IF;
            
            IF donations_exists THEN
                ALTER TABLE public.donations 
                ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
                ALTER COLUMN id SET DEFAULT gen_random_uuid(),
                ALTER COLUMN funeral_id TYPE UUID USING gen_random_uuid();
            END IF;
        END;
        $inner$;
        
        -- Recreate foreign key constraints
        ALTER TABLE public.condolences
        ADD CONSTRAINT condolences_funeral_id_fkey
        FOREIGN KEY (funeral_id) REFERENCES public.funerals(id) ON DELETE CASCADE;
        
        ALTER TABLE public.donations
        ADD CONSTRAINT donations_funeral_id_fkey
        FOREIGN KEY (funeral_id) REFERENCES public.funerals(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'ID conversion completed successfully!';
        
    ELSIF funerals_id_type = 'uuid' THEN
        RAISE NOTICE '=== IDs are already UUID type - no conversion needed ===';
    ELSE
        RAISE WARNING 'Unexpected ID type: %. Manual review required.', funerals_id_type;
    END IF;
END;
$$;

-- Step 3: Ensure all required columns exist
DO $$
BEGIN
    RAISE NOTICE '=== CHECKING REQUIRED COLUMNS ===';
    
    -- Add missing columns that might be expected by the API
    ALTER TABLE public.funerals 
    ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
    
    -- Check if views_count column was added or already exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funerals' AND column_name = 'views_count' AND table_schema = 'public') THEN
        RAISE NOTICE 'views_count column: ✓ exists';
    ELSE
        RAISE WARNING 'views_count column: ✗ missing';
    END IF;
END;
$$;

-- Step 4: Create/Fix the increment_funeral_views function
DROP FUNCTION IF EXISTS public.increment_funeral_views(UUID);
DROP FUNCTION IF EXISTS public.increment_funeral_views(bigint);

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
        RETURN 0;
    END IF;
    
    -- Get the updated view count
    SELECT views_count INTO new_view_count
    FROM public.funerals 
    WHERE id = funeral_uuid;
    
    RETURN COALESCE(new_view_count, 0);
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error incrementing funeral views for %: %', funeral_uuid, SQLERRM;
        RETURN 0;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.increment_funeral_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_funeral_views(UUID) TO anon;

-- Step 5: Verify everything is working
DO $$
DECLARE
    function_exists BOOLEAN;
    funerals_id_type TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICATION ===';
    
    -- Check function exists
    SELECT EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'increment_funeral_views'
        AND p.pronargs = 1
    ) INTO function_exists;
    
    -- Check final ID type
    SELECT data_type INTO funerals_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'funerals' AND column_name = 'id' AND table_schema = 'public';
    
    IF function_exists THEN
        RAISE NOTICE 'increment_funeral_views function: ✓ exists';
    ELSE
        RAISE WARNING 'increment_funeral_views function: ✗ missing';
    END IF;
    
    RAISE NOTICE 'funerals.id type: %', funerals_id_type;
    
    IF funerals_id_type = 'uuid' AND function_exists THEN
        RAISE NOTICE '=== ALL FIXES APPLIED SUCCESSFULLY! ===';
        RAISE NOTICE 'Your API should now work without the bigint error.';
    ELSE
        RAISE WARNING 'Some issues remain. Please review the output above.';
    END IF;
END;
$$;
