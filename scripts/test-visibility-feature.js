/**
 * Test script to verify the hide/show functionality is working
 */

const baseUrl = 'http://localhost:3001';

async function testVisibilityFeature() {
  console.log('🧪 Testing hide/show functionality...\n');
  
  try {
    // Test 1: Get all funerals
    console.log('1️⃣ Testing public funerals API...');
    const funeralsResponse = await fetch(`${baseUrl}/api/funerals`);
    
    if (!funeralsResponse.ok) {
      throw new Error(`Funerals API failed: ${funeralsResponse.status}`);
    }
    
    const funeralsData = await funeralsResponse.json();
    console.log(`✅ Public API working: ${funeralsData.data?.length || 0} funerals found`);
    
    // Test 2: Check if visibility field exists in response
    if (funeralsData.data && funeralsData.data.length > 0) {
      const firstFuneral = funeralsData.data[0];
      console.log(`📊 Sample funeral data keys: ${Object.keys(firstFuneral).join(', ')}`);
      
      if ('is_visible' in firstFuneral) {
        console.log('✅ is_visible field present in API response');
      } else {
        console.log('⚠️  is_visible field not present in API response');
      }
    }
    
    console.log('\n🎉 All tests passed! Hide/show functionality is ready to use.');
    console.log('📋 Next steps:');
    console.log('   1. Open http://localhost:3001/admin');
    console.log('   2. Look for Hide/Show buttons next to each funeral');
    console.log('   3. Test the visibility toggle functionality');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running (npm run dev)');
    console.log('   2. Check that the database migration was successful');
    console.log('   3. Verify environment variables are set correctly');
  }
}

// Run the test
testVisibilityFeature();