-- SQL script to add missing columns to fix the 500 error
-- This adds all columns that the API expects but are missing from the database

-- Add missing columns to the funerals table
ALTER TABLE public.funerals 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deceased_photo_url TEXT,
ADD COLUMN IF NOT EXISTS biography TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_funerals_views_count ON public.funerals(views_count);
CREATE INDEX IF NOT EXISTS idx_funerals_status ON public.funerals(status);
CREATE INDEX IF NOT EXISTS idx_funerals_funeral_date ON public.funerals(funeral_date);
CREATE INDEX IF NOT EXISTS idx_funerals_region ON public.funerals(region);

-- Update the increment_funeral_views function to work with UUID IDs
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
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = funeral_id_param;
    
    -- Get the updated view count
    SELECT views_count INTO new_view_count
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

-- Add some sample data to test with (optional, only if table is empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.funerals LIMIT 1) THEN
        INSERT INTO public.funerals (
            id,
            organizer_id,
            deceased_name, 
            family_name, 
            region, 
            location, 
            venue,
            funeral_date, 
            funeral_time,
            date_of_birth,
            date_of_death,
            status,
            deceased_photo_url,
            biography,
            views_count
        ) VALUES 
        (
            '660e8400-e29b-41d4-a716-446655440001',
            '550e8400-e29b-41d4-a716-446655440002',
            'John Doe', 
            'Doe Family', 
            'Greater Accra', 
            'Accra',
            'Christ the King Catholic Church',
            '2025-08-20', 
            '10:00:00',
            '1950-01-01',
            '2025-08-10',
            'approved',
            '/funeral1.jpg',
            'A loving father and husband who will be deeply missed.',
            5
        ),
        (
            '660e8400-e29b-41d4-a716-446655440002',
            '550e8400-e29b-41d4-a716-446655440003',
            'Mary Smith', 
            'Smith Family', 
            'Ashanti', 
            'Kumasi',
            'Wesley Methodist Church',
            '2025-08-25', 
            '14:00:00',
            '1955-05-05',
            '2025-08-12',
            'approved',
            '/funeral2.jpg',
            'A dedicated teacher who touched many lives.',
            12
        );
    END IF;
END;
$$;
