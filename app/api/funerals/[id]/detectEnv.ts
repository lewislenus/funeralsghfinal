// Helper function to ensure we have the right environment variable
// This checks both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
export function getServiceRoleKey(): string | undefined {
  // Try different variations of the service role key name
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  // Log which environment variable was found (for debugging)
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Found SUPABASE_SERVICE_ROLE_KEY");
  } else if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Found NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY - this is less secure but will work");
  } else {
    console.log("No service role key found in environment variables");
  }
  
  return serviceKey;
}
