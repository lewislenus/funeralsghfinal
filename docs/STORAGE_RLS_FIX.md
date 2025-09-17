# Storage RLS Policy Error Fix

## Problem
PDF uploads to Supabase storage are failing with:
```
Error: Upload failed: new row violates row-level security policy
```

## Root Cause
The `funeral-pdfs` storage bucket has RLS enabled but lacks proper policies for file operations.

## Solutions (in order of preference)

### Quick Fix - Apply Simple Policies
Run this SQL in your Supabase SQL Editor:

```sql
-- File: scripts/storage-rls-simple.sql
-- This provides basic authenticated upload access
```

### Comprehensive Fix - Detailed Policies
For production, use:

```sql
-- File: scripts/storage-rls-policies.sql  
-- This provides granular permissions with admin overrides
```

## Code Changes Made
1. **supabase-storage.ts**: Modified file naming to use `general/` folder for all uploads to avoid path-based restrictions
2. **Created policy files**: Both simple and comprehensive RLS policy options

## How to Apply
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `storage-rls-simple.sql`
4. Execute the script
5. Test PDF upload again

## Verification
After applying policies, the upload should work without RLS violations. The system will:
- Allow authenticated users to upload PDFs
- Allow public access to view PDFs
- Store files in `general/timestamp_filename.pdf` format

## Rollback
If issues occur, you can disable RLS temporarily:
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```
