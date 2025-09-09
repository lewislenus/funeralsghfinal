import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// Ensure the environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

// Create a single instance of the Supabase client for admin operations
const adminSupabase: SupabaseClient<Database> = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export { adminSupabase };
