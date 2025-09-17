/**
 * Quick Console Test for Supabase Storage
 * 
 * Run this in browser console on your app to test storage
 */

// Test function to run in browser console
window.testSupabaseStorage = async function() {
  console.log('🧪 Testing Supabase Storage Connection...');
  
  try {
    // Import the test function (adjust path as needed)
    const { runStorageTests } = await import('/lib/test-supabase-storage.js');
    
    const results = await runStorageTests();
    
    if (results.bucketTest.success) {
      console.log('✅ Supabase storage is working correctly!');
      console.log('📁 Bucket accessible:', results.bucketTest.bucketExists);
      
      if (results.uploadTest?.success) {
        console.log('📤 Upload test passed');
        console.log('🔗 Test file URL:', results.uploadTest.url);
      }
    } else {
      console.log('❌ Storage test failed:', results.bucketTest.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

console.log('Run testSupabaseStorage() to test your storage setup');
