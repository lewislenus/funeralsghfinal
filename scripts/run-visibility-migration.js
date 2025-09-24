/**
 * Migration script to add is_visible column to funerals table
 * Run this script to add the visibility feature to your database
 */

const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
  console.log('🚀 Starting migration to add is_visible column...');
  
  // Load environment variables from .env.local manually
  const fs = require('fs');
  const path = require('path');
  
  let supabaseUrl, serviceRoleKey;
  
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim();
      } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        serviceRoleKey = line.split('=')[1].trim();
      }
    }
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error.message);
  }
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('   Please check your .env.local file');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Check if column already exists
    console.log('🔍 Checking if is_visible column already exists...');
    const { data: columns, error: columnsError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'funerals' 
        AND column_name = 'is_visible';
      `
    });
    
    if (columnsError) {
      console.log('⚠️  Could not check columns, proceeding with migration...');
    } else if (columns && columns.length > 0) {
      console.log('✅ is_visible column already exists, skipping migration');
      return;
    }
    
    // Add the column
    console.log('📝 Adding is_visible column to funerals table...');
    const { error: alterError } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE public.funerals 
        ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
      `
    });
    
    if (alterError) {
      throw new Error(`Failed to add column: ${alterError.message}`);
    }
    
    // Create index
    console.log('📊 Creating index for performance...');
    const { error: indexError } = await supabase.rpc('sql', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_funerals_visibility ON public.funerals(is_visible);
      `
    });
    
    if (indexError) {
      console.warn(`⚠️  Warning: Could not create index: ${indexError.message}`);
    }
    
    // Update RLS policy
    console.log('🔒 Updating Row Level Security policy...');
    const { error: policyError } = await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Anyone can view approved funerals" ON public.funerals;
        CREATE POLICY "Anyone can view approved and visible funerals" ON public.funerals
          FOR SELECT USING (status = 'approved' AND is_visible = TRUE);
      `
    });
    
    if (policyError) {
      console.warn(`⚠️  Warning: Could not update RLS policy: ${policyError.message}`);
    }
    
    // Update existing funerals to be visible
    console.log('🔄 Setting existing funerals to visible...');
    const { error: updateError } = await supabase.rpc('sql', {
      query: `
        UPDATE public.funerals SET is_visible = TRUE WHERE is_visible IS NULL;
      `
    });
    
    if (updateError) {
      console.warn(`⚠️  Warning: Could not update existing funerals: ${updateError.message}`);
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('🎉 You can now use the hide/show functionality in the admin dashboard');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
runMigration();