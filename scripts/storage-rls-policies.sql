-- Storage RLS Policies for funeral-pdfs bucket
-- Apply this in the Supabase SQL Editor

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage.buckets (if not already enabled) 
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for funeral-pdfs bucket (cleanup)
DROP POLICY IF EXISTS "funeral_pdfs_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "funeral_pdfs_bucket_access" ON storage.buckets;

-- Create bucket access policy
CREATE POLICY "funeral_pdfs_bucket_access"
ON storage.buckets
FOR SELECT
TO public
USING (name = 'funeral-pdfs');

-- Allow authenticated users to upload PDFs to funeral-pdfs bucket
CREATE POLICY "funeral_pdfs_insert_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'funeral-pdfs' 
  AND (storage.foldername(name))[1] IN ('general', 'funeral_' || auth.uid()::text)
);

-- Allow public access to view PDFs (for public funeral viewing)
CREATE POLICY "funeral_pdfs_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'funeral-pdfs');

-- Allow authenticated users to update their own PDFs
CREATE POLICY "funeral_pdfs_update_policy"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'funeral-pdfs'
  AND (
    -- Allow if it's in general folder and user is authenticated
    (storage.foldername(name))[1] = 'general'
    OR
    -- Allow if it's in user's specific funeral folder
    (storage.foldername(name))[1] LIKE 'funeral_%'
  )
)
WITH CHECK (
  bucket_id = 'funeral-pdfs'
  AND (
    (storage.foldername(name))[1] = 'general'
    OR
    (storage.foldername(name))[1] LIKE 'funeral_%'
  )
);

-- Allow authenticated users to delete their own PDFs
CREATE POLICY "funeral_pdfs_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'funeral-pdfs'
  AND (
    -- Allow if it's in general folder and user is authenticated
    (storage.foldername(name))[1] = 'general'
    OR
    -- Allow if it's in user's specific funeral folder
    (storage.foldername(name))[1] LIKE 'funeral_%'
  )
);

-- Admin override policies (allow admin full access)
CREATE POLICY "funeral_pdfs_admin_all_access"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'funeral-pdfs'
  AND auth.jwt() ->> 'email' = 'funeralsghana@gmail.com'
)
WITH CHECK (
  bucket_id = 'funeral-pdfs'
  AND auth.jwt() ->> 'email' = 'funeralsghana@gmail.com'
);
