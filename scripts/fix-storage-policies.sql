-- Fix Storage Bucket Policies for PDF uploads
-- This script creates the necessary policies for Supabase Storage

-- First, let's create the bucket if it doesn't exist (manually via Supabase dashboard or this won't work due to RLS)
-- You may need to create the bucket "funeral-pdfs" manually in the Supabase dashboard

-- Allow authenticated users to upload PDFs to their own funeral folders
CREATE POLICY "Users can upload funeral PDFs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'funeral-pdfs' AND
  (storage.foldername(name))[1] = 'funeral_' || auth.uid()::text
  OR (storage.foldername(name))[1] = 'general'
);

-- Allow authenticated users to read PDFs
CREATE POLICY "Users can view funeral PDFs" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'funeral-pdfs');

-- Allow public to read approved funeral PDFs
CREATE POLICY "Public can view funeral PDFs" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'funeral-pdfs');

-- Allow users to update their own funeral PDFs
CREATE POLICY "Users can update their funeral PDFs" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'funeral-pdfs' AND
  (storage.foldername(name))[1] = 'funeral_' || auth.uid()::text
);

-- Allow users to delete their own funeral PDFs
CREATE POLICY "Users can delete their funeral PDFs" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'funeral-pdfs' AND
  (storage.foldername(name))[1] = 'funeral_' || auth.uid()::text
);

-- Admin policies for storage (using the same admin check as other tables)
CREATE POLICY "Admin can manage all funeral PDFs" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'funeral-pdfs' AND
  auth.email() = 'funeralsghana@gmail.com'
)
WITH CHECK (
  bucket_id = 'funeral-pdfs' AND
  auth.email() = 'funeralsghana@gmail.com'
);
