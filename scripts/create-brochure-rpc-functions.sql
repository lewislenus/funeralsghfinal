-- RPC Functions for Brochure Management
-- These functions provide CRUD operations for the brochures table
-- while bypassing TypeScript type issues with direct table access

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS get_brochures_for_funeral(UUID);
DROP FUNCTION IF EXISTS get_all_brochures_with_funerals();
DROP FUNCTION IF EXISTS create_brochure(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, INTEGER, TEXT, BOOLEAN, INTEGER, UUID);
DROP FUNCTION IF EXISTS update_brochure(UUID, JSON);
DROP FUNCTION IF EXISTS delete_brochure(UUID);

-- Function to get brochures for a specific funeral
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

-- Function to get all brochures with funeral information
CREATE OR REPLACE FUNCTION get_all_brochures_with_funerals()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', b.id,
      'funeral_id', b.funeral_id,
      'title', b.title,
      'description', b.description,
      'pdf_url', b.pdf_url,
      'cloudinary_public_id', b.cloudinary_public_id,
      'thumbnail_url', b.thumbnail_url,
      'file_size', b.file_size,
      'page_count', b.page_count,
      'upload_type', b.upload_type,
      'is_active', b.is_active,
      'display_order', b.display_order,
      'created_by', b.created_by,
      'created_at', b.created_at,
      'updated_at', b.updated_at,
      'funerals', json_build_object(
        'id', f.id,
        'deceased_name', f.deceased_name,
        'status', f.status
      )
    )
  ) INTO result
  FROM brochures b
  LEFT JOIN funerals f ON b.funeral_id = f.id
  ORDER BY b.created_at DESC;
  
  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new brochure
CREATE OR REPLACE FUNCTION create_brochure(
  funeral_id UUID,
  title TEXT,
  description TEXT DEFAULT NULL,
  pdf_url TEXT DEFAULT NULL,
  cloudinary_public_id TEXT DEFAULT NULL,
  thumbnail_url TEXT DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  page_count INTEGER DEFAULT NULL,
  upload_type TEXT DEFAULT 'cloudinary',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  new_brochure JSON;
BEGIN
  INSERT INTO brochures (
    funeral_id,
    title,
    description,
    pdf_url,
    cloudinary_public_id,
    thumbnail_url,
    file_size,
    page_count,
    upload_type,
    is_active,
    display_order,
    created_by
  ) VALUES (
    funeral_id,
    title,
    description,
    pdf_url,
    cloudinary_public_id,
    thumbnail_url,
    file_size,
    page_count,
    upload_type,
    is_active,
    display_order,
    created_by
  )
  RETURNING json_build_object(
    'id', id,
    'funeral_id', funeral_id,
    'title', title,
    'description', description,
    'pdf_url', pdf_url,
    'cloudinary_public_id', cloudinary_public_id,
    'thumbnail_url', thumbnail_url,
    'file_size', file_size,
    'page_count', page_count,
    'upload_type', upload_type,
    'is_active', is_active,
    'display_order', display_order,
    'created_by', created_by,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO new_brochure;
  
  RETURN new_brochure;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a brochure
CREATE OR REPLACE FUNCTION update_brochure(
  brochure_id UUID,
  updates JSON
)
RETURNS JSON AS $$
DECLARE
  updated_brochure JSON;
BEGIN
  UPDATE brochures SET
    title = COALESCE((updates->>'title')::TEXT, title),
    description = COALESCE((updates->>'description')::TEXT, description),
    pdf_url = COALESCE((updates->>'pdf_url')::TEXT, pdf_url),
    cloudinary_public_id = COALESCE((updates->>'cloudinary_public_id')::TEXT, cloudinary_public_id),
    thumbnail_url = COALESCE((updates->>'thumbnail_url')::TEXT, thumbnail_url),
    file_size = COALESCE((updates->>'file_size')::BIGINT, file_size),
    page_count = COALESCE((updates->>'page_count')::INTEGER, page_count),
    upload_type = COALESCE((updates->>'upload_type')::TEXT, upload_type),
    is_active = COALESCE((updates->>'is_active')::BOOLEAN, is_active),
    display_order = COALESCE((updates->>'display_order')::INTEGER, display_order),
    updated_at = NOW()
  WHERE id = brochure_id
  RETURNING json_build_object(
    'id', id,
    'funeral_id', funeral_id,
    'title', title,
    'description', description,
    'pdf_url', pdf_url,
    'cloudinary_public_id', cloudinary_public_id,
    'thumbnail_url', thumbnail_url,
    'file_size', file_size,
    'page_count', page_count,
    'upload_type', upload_type,
    'is_active', is_active,
    'display_order', display_order,
    'created_by', created_by,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO updated_brochure;
  
  RETURN updated_brochure;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a brochure
CREATE OR REPLACE FUNCTION delete_brochure(
  brochure_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM brochures 
  WHERE id = brochure_id;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_brochures_for_funeral(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_brochures_with_funerals() TO authenticated;
GRANT EXECUTE ON FUNCTION create_brochure(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, INTEGER, TEXT, BOOLEAN, INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_brochure(UUID, JSON) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_brochure(UUID) TO authenticated;
