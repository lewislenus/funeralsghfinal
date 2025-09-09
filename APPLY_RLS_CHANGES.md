# Implementing RLS Policy Changes

This document outlines the steps to apply the improved Row Level Security (RLS) policies to your Supabase database.

## Option 1: Using Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `scripts/apply_rls_policies.sql`
4. Paste the SQL into the editor and run it

## Option 2: Using Migration (If local development is set up)

```bash
# Start Docker and Supabase services
docker start
npx supabase start

# Apply the migration
npx supabase migration up
```

## Testing the Policies

After applying the policies, you can test them using:

```bash
# First, ensure you're logged in as admin
node scripts/test-admin-access.js
```

## Verifying Admin Access

1. Log in as the admin user (funeralsghana@gmail.com)
2. Navigate to the `/admin` page
3. You should be able to:
   - View all funerals
   - Approve/reject pending funerals
   - Access all admin functionality

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that RLS is enabled on the funerals table
3. Confirm that the admin email matches exactly: "funeralsghana@gmail.com"
4. Test with a new admin session (log out and log back in)
