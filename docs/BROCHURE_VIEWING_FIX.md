# Brochure Viewing Fix Documentation

## Issue Identified
The brochure viewing functionality in the funeral details page was not working due to several mismatches between the database schema, TypeScript types, and RPC function implementations.

## Root Causes

### 1. Schema Mismatch
- **Database Schema**: Uses `pdf_url` field to store the brochure URL
- **RPC Functions**: Were incorrectly returning `cloudinary_url` instead of `pdf_url`
- **TypeScript Types**: Correctly defined `pdf_url` but RPC functions didn't match

### 2. Missing Database Fields
- **Database Schema**: Has `page_count` field
- **TypeScript Types**: Were missing `page_count` field
- **RPC Functions**: Were trying to return `page_count` but types didn't support it

### 3. Parameter Name Mismatch
- **RPC Function**: Expected parameter named `funeral_id_param`
- **API Call**: Was passing parameter as `funeral_uuid`

## Fixes Applied

### 1. Updated TypeScript Types (`lib/api/brochure.ts`)
```typescript
export type Brochure = {
  // ... existing fields
  page_count: number | null;  // Added missing field
  // ... rest of fields
};

export type BrochureInsert = {
  // ... existing fields  
  page_count?: number | null;  // Added missing field
  // ... rest of fields
};

export type BrochureUpdate = {
  // ... existing fields
  page_count?: number | null;  // Added missing field
  cloudinary_public_id?: string | null;  // Added missing field
  file_size?: number | null;  // Added missing field
  upload_type?: string;  // Added missing field
  // ... rest of fields
};
```

### 2. Fixed RPC Function Parameter Name
```typescript
// Before
.rpc('get_brochures_for_funeral', { funeral_uuid: funeralId })

// After  
.rpc('get_brochures_for_funeral', { funeral_id_param: funeralId })
```

### 3. Updated RPC Functions Schema
**Fixed in both `scripts/create-brochure-rpc-functions.sql` and `supabase/migrations/20250815000000_add_brochure_rpc_functions.sql`:**

- Changed all `cloudinary_url` references to `pdf_url`
- Updated function return types to match database schema
- Fixed parameter mappings in INSERT and UPDATE operations

## Immediate Solution

To quickly fix the brochure viewing functionality:

1. **Run the Quick Fix Script**: Execute `scripts/quick-fix-brochure-viewing.sql` in your Supabase SQL editor
2. **Verify Table Structure**: Ensure your `brochures` table has the `pdf_url` field (not `cloudinary_url`)
3. **Test Functionality**: Try viewing brochures on a funeral details page

## Files Modified

### Core Files
- `lib/api/brochure.ts` - Fixed TypeScript types and API calls
- `scripts/create-brochure-rpc-functions.sql` - Fixed RPC function schema
- `scripts/quick-fix-brochure-viewing.sql` - Created quick fix script

### Component Files (Already Working)
- `components/funeral-event-page.tsx` - Already correctly implemented to use `pdf_url`
- `components/admin-brochure-upload.tsx` - Already correctly saves to `pdf_url`

## Testing Steps

1. Upload a brochure through the admin dashboard
2. Navigate to a funeral details page that has brochures
3. Verify brochures appear in both the "Overview" tab and the sidebar
4. Test that "View" and "Download" buttons work correctly
5. Ensure the flipbook viewer loads the PDF properly

## Expected Behavior After Fix

- Brochures should load on funeral details pages
- PDF viewer should display brochures in flipbook format
- View and download buttons should work correctly
- No TypeScript compilation errors
- No runtime errors in browser console

## Database Schema Verification

Make sure your `brochures` table has these essential fields:
```sql
- id (UUID, primary key)
- funeral_id (UUID, foreign key to funerals)
- title (VARCHAR, not null)
- pdf_url (TEXT, not null)  -- This is critical!
- thumbnail_url (TEXT, nullable)
- cloudinary_public_id (TEXT, nullable)
- file_size (BIGINT, nullable)
- page_count (INTEGER, nullable)
- is_active (BOOLEAN, default true)
- created_at, updated_at (TIMESTAMP)
```

If your table has `cloudinary_url` instead of `pdf_url`, you'll need to migrate the data or update the schema accordingly.
