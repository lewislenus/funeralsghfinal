# PDF Storage Setup Instructions

## Manual Bucket Creation (Required)

Since bucket creation requires admin permissions, you need to create the storage bucket manually in the Supabase dashboard:

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to Storage > Buckets

2. **Create the Bucket**
   - Click "Create Bucket"
   - Name: `funeral-pdfs`
   - Make it **Public** (checked)
   - Set file size limit: `10MB`
   - Allowed MIME types: `application/pdf`

3. **Apply Storage Policies**
   - Run the SQL script: `scripts/fix-storage-policies.sql`
   - You can run this in the SQL Editor in your Supabase dashboard

## Bucket Configuration

- **Name**: `funeral-pdfs`
- **Public Access**: Yes (allows direct PDF viewing)
- **File Size Limit**: 10MB 
- **Allowed Types**: PDF only
- **Folder Structure**:
  - `funeral_{funeral_id}/` - PDFs for specific funerals
  - `general/` - General uploaded PDFs

## Storage Policies Applied

The storage policies ensure:
- Users can upload PDFs to their own funeral folders
- Public can view all funeral PDFs (for public sharing)
- Admin can manage all PDFs
- Authenticated users can view/download PDFs

## Testing Storage

After setup, test the functionality:

1. Go to `/create-funeral` page
2. Try uploading a PDF brochure
3. The upload should work without RLS errors
4. The PDF should be accessible via the returned URL

## Fallback to Cloudinary

If Supabase storage fails, the system will automatically fallback to Cloudinary upload, so users won't experience interruptions.

## Environment Variables

Make sure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
