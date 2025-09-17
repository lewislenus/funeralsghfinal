-- IMMEDIATE FIX: Run this in Supabase SQL Editor
-- This will drop and recreate the get_brochures_for_funeral function

-- Drop the existing function
DROP FUNCTION IF EXISTS get_brochures_for_funeral(UUID);

-- Recreate with correct return type
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
