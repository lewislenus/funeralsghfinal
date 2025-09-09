# Database Migration Instructions

When you need to update the database schema, follow these steps:

1.  **Open your Supabase Project:** Navigate to your project dashboard at [https://nyuprxdfgqymaktktqwx.supabase.co](https://nyuprxdfgqymaktktqwx.supabase.co).
2.  **Go to the SQL Editor:** In the left sidebar, click on the "SQL Editor" icon.
3.  **Run the Migration Script:**
    *   Open the file `scripts/add-missing-columns.sql` in your code editor.
    *   Copy the entire contents of the file.
    *   Paste the SQL into the Supabase SQL Editor.
    *   Click the "Run" button.

This will apply the latest schema changes to your database.

## Current Situation
Your current `funerals` table is missing several columns that are needed to store all the data from your funeral creation form.

## Required SQL Commands

Run these SQL commands in your Supabase SQL editor to add the missing columns:

```sql
-- Add missing columns to the funerals table
ALTER TABLE public.funerals 
ADD COLUMN IF NOT EXISTS funeral_time TIME,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS family_name TEXT,
ADD COLUMN IF NOT EXISTS family_contact TEXT,
ADD COLUMN IF NOT EXISTS poster_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];

-- Add comments to document the columns
COMMENT ON COLUMN public.funerals.funeral_time IS 'Time of the funeral service';
COMMENT ON COLUMN public.funerals.venue IS 'Venue where the funeral will be held';
COMMENT ON COLUMN public.funerals.region IS 'Region/state where the funeral is taking place';
COMMENT ON COLUMN public.funerals.location IS 'City/town where the funeral is taking place';
COMMENT ON COLUMN public.funerals.family_name IS 'Name of the family organizing the funeral';
COMMENT ON COLUMN public.funerals.family_contact IS 'Contact information for the family';
COMMENT ON COLUMN public.funerals.poster_url IS 'URL to the funeral poster image';
COMMENT ON COLUMN public.funerals.gallery_urls IS 'Array of URLs for gallery images';
```

## Form Data Mapping

Here's how the form fields will map to your database columns:

| Form Field | Database Column | Type | Notes |
|------------|----------------|------|-------|
| `deceased_name` | `deceased_name` | TEXT | ✅ Already exists |
| `date_of_birth` | `date_of_birth` | DATE | ✅ Already exists |
| `date_of_death` | `date_of_death` | DATE | ✅ Already exists |
| `funeral_date` | `funeral_date` | TIMESTAMP | ✅ Already exists |
| `funeral_time` | `funeral_time` | TIME | ➕ New column |
| `venue` | `venue` | TEXT | ➕ New column |
| `region` | `region` | TEXT | ➕ New column |
| `location` | `location` | TEXT | ➕ New column |
| `family_name` | `family_name` | TEXT | ➕ New column |
| `family_contact` | `family_contact` | TEXT | ➕ New column |
| `organized_by` | `organized_by` | TEXT | ✅ Already exists |
| `life_story` | `life_story` | TEXT | ✅ Already exists |
| `poster_url` | `poster_url` | TEXT | ➕ New column |
| `image_url` | `image_url` | TEXT | ✅ Already exists |
| `gallery_urls` | `gallery_urls` | TEXT[] | ➕ New column |
| `brochure_url` | `brochure_url` | TEXT | ✅ Already exists |
| `livestream_url` | `livestream_url` | TEXT | ✅ Already exists |

## Notes

1. **Duplicate Location Fields**: You now have both `funeral_location` (existing) and `location` (new). Consider:
   - Using `location` for city/town
   - Using `funeral_location` for full address/venue details
   - Or consolidating them into one field

2. **Gallery URLs**: Stored as a TEXT array (`TEXT[]`) to handle multiple image URLs

3. **Time Handling**: `funeral_time` is stored separately from `funeral_date` for better flexibility

## After Running the Migration

1. Replace your current `lib/supabase/types.ts` with the corrected version in `lib/supabase/types-corrected.ts`
2. Test the funeral creation form to ensure all data is being saved properly
3. Update any queries that reference the old schema

## Verification Query

After running the migration, verify the table structure with:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'funerals' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

This should show all the columns including the newly added ones.
