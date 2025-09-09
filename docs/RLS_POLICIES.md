# Funeral Portal Row Level Security (RLS) Policies

This document outlines the Row Level Security (RLS) policies implemented for the Funeral Portal database.

## Funerals Table Policies

### Admin Policies

The following policies allow admin users (identified by email "funeralsghana@gmail.com") to have full access:

1. **admin_select_funerals**: Admins can view all funerals regardless of status
2. **admin_insert_funerals**: Admins can create funerals
3. **admin_update_funerals**: Admins can update any funeral 
4. **admin_delete_funerals**: Admins can delete any funeral

### Public Policies

These policies control what public (unauthenticated) users can access:

1. **public_view_approved_funerals**: Anyone can view funerals with "approved" status

### User Policies

These policies determine what authenticated non-admin users can do:

1. **users_create_own_funerals**: Users can create their own funerals (user_id = auth.uid())
2. **users_view_own_funerals**: Users can view their own funerals, even if not approved
3. **users_update_own_funerals**: Users can update their own funerals
4. **users_delete_own_funerals**: Users can delete their own funerals

## Implementation Notes

- The admin is identified by the email "funeralsghana@gmail.com"
- User ownership is determined by the `user_id` column matching the authenticated user's ID
- Public users can only see approved funerals
- RLS is enabled on the funerals table

## Migrating Policies

If changes to policies are needed, create a new migration using:

```bash
npx supabase migration new update_funeral_rls
```

Then edit the created SQL file with your policy changes.
