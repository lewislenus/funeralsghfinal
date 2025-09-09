# Fix Instructions for Console Errors

## Issues Fixed

### 1. PDF.js CORS Error ✅
**Error:** `Access to script at 'https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:** Updated `components/flipbook-viewer.tsx` to use a more reliable CDN (jsdelivr) for the PDF.js worker.

### 2. Missing Supabase RPC Function ✅
**Error:** `Failed to load resource: the server responded with a status of 404 () nyuprxdfgqymaktktqwx.supabase.co/rest/v1/rpc/increment_funeral_views`

**Solution:** Created the missing `increment_funeral_views` RPC function in the SQL script.

## Required Action: Run SQL Script

You need to execute the SQL script to add the missing database function and columns:

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase dashboard: https://nyuprxdfgqymaktktqwx.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/add-missing-columns-clean.sql`
4. Click **Run** to execute the script

### Option 2: Using psql (if available)
```bash
psql "postgresql://postgres:[YOUR_PASSWORD]@db.nyuprxdfgqymaktktqwx.supabase.co:5432/postgres" -f "scripts/add-missing-columns-clean.sql"
```

## What the SQL Script Does

1. **Adds missing columns** to the `funerals` table:
   - `funeral_time`, `venue`, `region`, `location`
   - `family_name`, `family_contact`
   - `poster_url`, `gallery_urls`
   - `view_count` (for tracking page views)

2. **Creates the `increment_funeral_views` RPC function** that:
   - Safely increments the view count for a funeral
   - Returns the new view count
   - Has proper error handling
   - Grants permissions to authenticated and anonymous users

3. **Adds foreign key constraints** for better data integrity

## After Running the Script

Once you've executed the SQL script in Supabase:
1. Refresh your application
2. The 404 error for `increment_funeral_views` should be resolved
3. The PDF.js CORS errors should be fixed
4. Your application should work without console errors

## Verification

To verify the fixes worked:
1. Check the browser console - no more 404 or CORS errors
2. Try viewing a funeral page - view count should increment
3. Try opening a PDF brochure - should load without CORS errors
