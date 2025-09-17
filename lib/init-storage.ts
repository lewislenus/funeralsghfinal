import { initializePdfStorage } from '@/lib/pdf-storage-manager';

export async function setupApplicationStorage() {
  try {
    console.log('🚀 Initializing PDF storage system...');
    
    await initializePdfStorage();
    
    console.log('✅ PDF storage system ready!');
    console.log('📝 Supabase bucket: funeral-pdfs');
    console.log('🔧 Storage manager configured');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Storage initialization failed:', error);
    console.log('🔄 Fallback to Cloudinary available');
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: 'cloudinary'
    };
  }
}

// Only initialize storage in production runtime, not during build
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';
const isDev = process.env.NODE_ENV === 'development';

if (typeof window === 'undefined' && !isBuild) {
  // Server-side initialization only in non-build environments
  setupApplicationStorage().then((result) => {
    if (!result.success) {
      console.warn('Storage initialization incomplete, but fallbacks available');
    }
  }).catch((error) => {
    console.warn('Storage initialization failed silently:', error);
  });
}
