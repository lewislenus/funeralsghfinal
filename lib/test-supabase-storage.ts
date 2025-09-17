/**
 * Test Supabase Storage Connection
 * 
 * This file contains utility functions to test the Supabase storage setup
 */

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

/**
 * Test if the funeral-pdfs bucket is accessible
 */
export async function testSupabaseBucket(): Promise<{
  success: boolean;
  message: string;
  bucketExists: boolean;
  canList: boolean;
}> {
  try {
    console.log('Testing Supabase storage bucket...');
    
    // Test 1: Check if we can list buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    let bucketExists = false;
    let canList = false;
    
    if (!listError && buckets) {
      canList = true;
      bucketExists = buckets.some(bucket => bucket.name === 'funeral-pdfs');
      console.log('Available buckets:', buckets.map(b => b.name));
    } else {
      console.log('Cannot list buckets (normal for non-admin users):', listError?.message);
    }
    
    // Test 2: Try to list files in the funeral-pdfs bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('funeral-pdfs')
      .list('', { limit: 1 });
    
    if (!filesError) {
      console.log('✅ Can access funeral-pdfs bucket');
      bucketExists = true;
      canList = true;
    } else {
      console.log('❌ Cannot access funeral-pdfs bucket:', filesError.message);
    }
    
    // Test 3: Generate a public URL to verify bucket is public
    const { data: urlData } = supabase.storage
      .from('funeral-pdfs')
      .getPublicUrl('test-file.pdf');
    
    console.log('Public URL format:', urlData.publicUrl);
    
    const success = bucketExists || !filesError;
    const message = success 
      ? 'Supabase storage is properly configured and accessible'
      : 'Supabase storage may need configuration';
    
    return {
      success,
      message,
      bucketExists,
      canList
    };
    
  } catch (error) {
    console.error('Error testing Supabase storage:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      bucketExists: false,
      canList: false
    };
  }
}

/**
 * Test upload a small file to verify write permissions
 */
export async function testSupabaseUpload(): Promise<{
  success: boolean;
  message: string;
  url?: string;
}> {
  try {
    // Create a small test file
    const testContent = 'Test file for Supabase storage verification';
    const testFile = new File([testContent], 'test-storage.txt', { type: 'text/plain' });
    
    const timestamp = Date.now();
    const testPath = `test/${timestamp}-storage-test.txt`;
    
    console.log('Testing file upload...');
    
    // Upload test file
    const { data, error } = await supabase.storage
      .from('funeral-pdfs')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('funeral-pdfs')
      .getPublicUrl(testPath);
    
    console.log('✅ Test upload successful');
    console.log('Test file URL:', urlData.publicUrl);
    
    // Clean up test file (optional)
    setTimeout(async () => {
      await supabase.storage
        .from('funeral-pdfs')
        .remove([testPath]);
      console.log('🧹 Test file cleaned up');
    }, 5000);
    
    return {
      success: true,
      message: 'Upload test successful',
      url: urlData.publicUrl
    };
    
  } catch (error) {
    console.error('Upload test failed:', error);
    return {
      success: false,
      message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Run all storage tests
 */
export async function runStorageTests() {
  console.log('🧪 Running Supabase Storage Tests...');
  console.log('=====================================');
  
  const bucketTest = await testSupabaseBucket();
  console.log('📁 Bucket Test:', bucketTest.message);
  
  if (bucketTest.success) {
    const uploadTest = await testSupabaseUpload();
    console.log('📤 Upload Test:', uploadTest.message);
    
    if (uploadTest.success) {
      console.log('🎉 All tests passed! Supabase storage is ready for PDF uploads.');
    }
  }
  
  console.log('=====================================');
  
  return {
    bucketTest,
    uploadTest: bucketTest.success ? await testSupabaseUpload() : null
  };
}
