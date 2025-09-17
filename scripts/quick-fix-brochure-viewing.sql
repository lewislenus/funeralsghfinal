-- Quick script to create the RPC functions directly in Supabase
-- Run this in the Supabase SQL editor to make brochure viewing work

-- Drop existing function first to avoid conflicts
DROP FUNCTION IF EXISTS get_brochures_for_funeral(UUID);

-- First ensure the brochures table exists (may already exist)
CREATE TABLE IF NOT EXISTS public.brochures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    funeral_id uuid NOT NULL REFERENCES public.funerals(id) ON DELETE CASCADE,
    title varchar(255) NOT NULL,
    description text,
    pdf_url text NOT NULL,
    thumbnail_url text,
    cloudinary_public_id text,
    file_size bigint,
    page_count integer,
    upload_type varchar(50) DEFAULT 'cloudinary',
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES auth.users(id)
);

-- Create the get_brochures_for_funeral function
CREATE OR REPLACE FUNCTION get_brochures_for_funeral(funeral_id_param UUID)
RETURNS TABLE (
  id UUID,
  funeral_id UUID,
  title TEXT,
  description TEXT,
  pdf_url TEXT,
  thumbnail_url TEXT,
  cloudinary_public_id TEXT,
  file_size BIGINT,
  page_count INTEGER,
  upload_type TEXT,
  is_active BOOLEAN,
  display_order INTEGER,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.funeral_id,
    b.title,
    b.description,
    b.pdf_url,
    b.thumbnail_url,
    b.cloudinary_public_id,
    b.file_size,
    b.page_count,
    b.upload_type,
    b.is_active,
    b.display_order,
    b.created_by,
    b.created_at,
    b.updated_at
  FROM brochures b
  WHERE b.funeral_id = funeral_id_param
    AND b.is_active = true
  ORDER BY b.display_order ASC, b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_brochures_for_funeral(UUID) TO authenticated;

-- Test the function (replace with actual funeral ID)
-- SELECT * FROM get_brochures_for_funeral('your-funeral-id-here');
