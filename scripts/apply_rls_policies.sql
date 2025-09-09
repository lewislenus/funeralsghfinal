-- IMPORTANT: This is a production migration script 
-- Apply this directly in the Supabase SQL Editor

-- Enable RLS on funerals table
ALTER TABLE "public"."funerals" ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Admin can approve funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can delete funeral records" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can delete funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can insert funeral records" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can select all funeral records" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can update event" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can update funeral records" ON "public"."funerals";
DROP POLICY IF EXISTS "Admin can view funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Allow admin to update funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Allow public read access to funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Public funerals are viewable by everyone" ON "public"."funerals";
DROP POLICY IF EXISTS "Users can create funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Users can delete their own funerals" ON "public"."funerals";
DROP POLICY IF EXISTS "Users can update their own funerals" ON "public"."funerals";

-- Create streamlined policies

-- ADMIN POLICIES
-- Admin full access (uses email check from your current implementation)
CREATE POLICY "admin_select_funerals" ON "public"."funerals"
FOR SELECT TO authenticated
USING (auth.jwt() ->> 'email' = 'funeralsghana@gmail.com');

CREATE POLICY "admin_insert_funerals" ON "public"."funerals"
FOR INSERT TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'funeralsghana@gmail.com');

CREATE POLICY "admin_update_funerals" ON "public"."funerals"
FOR UPDATE TO authenticated
USING (auth.jwt() ->> 'email' = 'funeralsghana@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'funeralsghana@gmail.com');

CREATE POLICY "admin_delete_funerals" ON "public"."funerals"
FOR DELETE TO authenticated
USING (auth.jwt() ->> 'email' = 'funeralsghana@gmail.com');

-- PUBLIC POLICIES
-- Allow anyone to view approved funerals
CREATE POLICY "public_view_approved_funerals" ON "public"."funerals"
FOR SELECT TO public
USING (status = 'approved');

-- USER POLICIES
-- Users can create their own funerals
CREATE POLICY "users_create_own_funerals" ON "public"."funerals"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own funerals (including not-yet-approved ones)
CREATE POLICY "users_view_own_funerals" ON "public"."funerals"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own funerals
CREATE POLICY "users_update_own_funerals" ON "public"."funerals"
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own funerals
CREATE POLICY "users_delete_own_funerals" ON "public"."funerals"
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
