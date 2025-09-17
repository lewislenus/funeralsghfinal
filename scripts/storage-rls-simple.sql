-- Simplified Storage RLS Policies for funeral-pdfs bucket
-- Apply this in the Supabase SQL Editor (simplified version for immediate fix)

-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for cleanup
DROP POLICY IF EXISTS "funeral_pdfs_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_bucket_access" ON storage.buckets;
DROP POLICY IF EXISTS "funeral_pdfs_admin_all_access" ON storage.objects;

-- Allow public access to the funeral-pdfs bucket
CREATE POLICY "funeral_pdfs_bucket_access"
ON storage.buckets
FOR SELECT
TO public
USING (name = 'funeral-pdfs');

-- Allow authenticated users to upload to funeral-pdfs bucket
CREATE POLICY "funeral_pdfs_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'funeral-pdfs');

-- Allow public read access to PDFs
CREATE POLICY "funeral_pdfs_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'funeral-pdfs');

-- Allow authenticated users to update/delete their uploads
CREATE POLICY "funeral_pdfs_authenticated_manage"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'funeral-pdfs')
WITH CHECK (bucket_id = 'funeral-pdfs');
