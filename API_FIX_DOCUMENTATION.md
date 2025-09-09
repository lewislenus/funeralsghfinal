# Fix for API Funerals 500 Error - RESOLVED ✅

## Problem
The `/api/funerals?sortBy=date` endpoint was returning a 500 Internal Server Error because:

1. **Incorrect Supabase Client Usage**: The API was using `createClientComponentClient` (client-side) in server-side API routes
2. **Database Schema Mismatch**: The TypeScript types defined `id` as `number` but the actual database uses `UUID` (string) primary keys
3. **Missing Columns**: The API code expected columns that didn't exist in the database:
   - `views_count` (for tracking page views)
   - `deceased_photo_url` (for deceased person's photo)  
   - `biography` (for life story)
   - `organizer_id` (for linking to the organizer)

## Root Cause
The main issue was using the wrong Supabase client in server-side API routes. `createClientComponentClient` from `@supabase/auth-helpers-nextjs` is meant for client-side usage only. Server-side API routes need to use `createClient` from `@supabase/supabase-js` directly.

## Solution Applied ✅

### 1. Fixed Supabase Client Usage (`lib/api/funerals.ts`)
```typescript
// Before (WRONG - caused fetch failed error)
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// After (CORRECT)  
import { createClient as createServerClient } from "@supabase/supabase-js";

function getSupabase() {
  if (typeof window === "undefined") {
    // Server-side: use createClient from supabase-js directly
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  // Client-side: use the component client
  return createBrowserClient();
}
```

### 2. Fixed TypeScript Types (`lib/supabase/types.ts`)
- Changed `id` type from `number` to `string` for all tables (funerals, condolences, donations)
- Added missing columns to the `funerals` table type definition:
  - `views_count: number | null`
  - `deceased_photo_url: string | null`
  - `biography: string | null`
  - `organizer_id: string | null`

### 3. Fixed API Code (`lib/api/funerals.ts`)
- Removed `parseInt()` calls that were trying to convert UUID strings to numbers
- Updated parameter validation to work with string IDs
- Fixed the `increment_funeral_views` function call to pass string UUIDs

### 4. Created Migration Script (`scripts/fix-missing-columns.sql`)
Run this SQL script in your Supabase SQL editor to add missing columns:

```sql
-- Add missing columns
ALTER TABLE public.funerals 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deceased_photo_url TEXT,
ADD COLUMN IF NOT EXISTS biography TEXT;

-- Create function for incrementing views
CREATE OR REPLACE FUNCTION increment_funeral_views(funeral_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_view_count INTEGER;
BEGIN
    UPDATE public.funerals 
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = funeral_id_param;
    
    SELECT views_count INTO new_view_count
    FROM public.funerals 
    WHERE id = funeral_id_param;
    
    RETURN COALESCE(new_view_count, 0);
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END;
$$;
```

## Database Setup
If you haven't set up the database yet, run these scripts in order:
1. `scripts/001-create-tables.sql` - Creates the base tables with UUID primary keys
2. `scripts/002-create-functions.sql` - Creates RPC functions  
3. `scripts/003-seed-data.sql` - Adds sample data
4. `scripts/fix-missing-columns.sql` - Adds missing columns (if needed)

## Testing Results ✅
After applying the fixes:
- ✅ The development server starts without errors
- ✅ The `/api/funerals?sortBy=date` endpoint returns 200 with data instead of 500 error
- ✅ The funerals page loads and displays funeral listings
- ✅ API successfully returns 2 funeral records from the database

## Environment Variables
Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Lesson
When building Next.js applications with Supabase:
- Use `createClient` from `@supabase/supabase-js` for server-side API routes
- Use `createClientComponentClient` from `@supabase/auth-helpers-nextjs` only for client-side components
- Always match your TypeScript types with your actual database schema
