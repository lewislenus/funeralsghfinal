import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function to verify admin access
async function testAdminAccess() {
  try {
    console.log('Testing admin authentication and RLS policies...');

    // 1. Check if user is signed in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('❌ No user is signed in. Please sign in as admin first.');
      return;
    }
    
    console.log(`✅ User is signed in: ${user.email}`);
    console.log(`User ID: ${user.id}`);
    
    // 2. Check if user can access funerals table
    const { data: funerals, error: funeralsError } = await supabase
      .from('funerals')
      .select('*')
      .limit(5);
    
    if (funeralsError) {
      console.error('❌ Failed to access funerals table:', funeralsError.message);
      return;
    }
    
    console.log(`✅ Successfully accessed funerals table (${funerals.length} records)`);
    
    // 3. Test if admin can update a funeral (if any exists)
    if (funerals.length > 0) {
      const testFuneral = funerals[0];
      const currentStatus = testFuneral.status;
      const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
      
      const { data: updateResult, error: updateError } = await supabase
        .from('funerals')
        .update({ status: newStatus })
        .eq('id', testFuneral.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Failed to update funeral:', updateError.message);
      } else {
        console.log(`✅ Successfully updated funeral status from ${currentStatus} to ${newStatus}`);
        
        // Revert the change
        await supabase
          .from('funerals')
          .update({ status: currentStatus })
          .eq('id', testFuneral.id);
        console.log('✅ Reverted test changes');
      }
    }
    
    console.log('RLS policy test completed');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testAdminAccess();
