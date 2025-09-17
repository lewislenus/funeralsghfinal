import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// Use fallback values during build time when environment variables aren't available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-role-key';

// Check if we're in a runtime environment and require real credentials
const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

if (isProduction && !isBuild && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  console.warn('Missing Supabase URL or Service Role Key in production environment');
}

// Create a single instance of the Supabase client for admin operations
const adminSupabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  serviceRoleKey,
  { auth: { persistSession: false } }
);

export { adminSupabase };
