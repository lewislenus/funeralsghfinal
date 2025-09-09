-- Migration script to fix ID column types from bigint to UUID
-- This addresses the error: invalid input syntax for type bigint

-- First, let's check what we're working with
DO $$
DECLARE
    funerals_id_type TEXT;
    condolences_id_type TEXT;
    donations_id_type TEXT;
BEGIN
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
    
    RAISE NOTICE 'Current data types:';
    RAISE NOTICE 'funerals.id: %', COALESCE(funerals_id_type, 'NOT FOUND');
    RAISE NOTICE 'condolences.id: %', COALESCE(condolences_id_type, 'NOT FOUND');
    RAISE NOTICE 'donations.id: %', COALESCE(donations_id_type, 'NOT FOUND');
END;
$$;

-- Only proceed if we need to convert from bigint to uuid
DO $$
DECLARE
    funerals_id_type TEXT;
BEGIN
    SELECT data_type INTO funerals_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'funerals' AND column_name = 'id' AND table_schema = 'public';
    
    IF funerals_id_type = 'bigint' THEN
        RAISE NOTICE 'Converting bigint IDs to UUID...';
        
        -- Drop all foreign key constraints first
        ALTER TABLE IF EXISTS public.condolences DROP CONSTRAINT IF EXISTS condolences_funeral_id_fkey;
        ALTER TABLE IF EXISTS public.donations DROP CONSTRAINT IF EXISTS donations_funeral_id_fkey;
        
        -- Convert funerals table
        ALTER TABLE public.funerals 
        ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        -- Convert foreign key columns
        ALTER TABLE public.condolences 
        ALTER COLUMN funeral_id TYPE UUID USING gen_random_uuid();
        
        ALTER TABLE public.donations 
        ALTER COLUMN funeral_id TYPE UUID USING gen_random_uuid();
        
        -- Convert primary keys for other tables if needed
        ALTER TABLE public.condolences 
        ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        ALTER TABLE public.donations 
        ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        -- Recreate foreign key constraints
        ALTER TABLE public.condolences
        ADD CONSTRAINT condolences_funeral_id_fkey
        FOREIGN KEY (funeral_id) REFERENCES public.funerals(id) ON DELETE CASCADE;
        
        ALTER TABLE public.donations
        ADD CONSTRAINT donations_funeral_id_fkey
        FOREIGN KEY (funeral_id) REFERENCES public.funerals(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Conversion completed successfully!';
    ELSIF funerals_id_type = 'uuid' THEN
        RAISE NOTICE 'IDs are already UUID type - no conversion needed';
    ELSE
        RAISE NOTICE 'Unexpected ID type: %. Manual review required.', funerals_id_type;
    END IF;
END;
$$;
