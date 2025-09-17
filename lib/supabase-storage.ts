/**
 * Supabase Storage for PDFs
 * 
 * This provides the most reliable and cost-effective PDF storage
 * with excellent integration to your existing Supabase setup
 */

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Lazy client creation to avoid build-time issues
function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build';
  
  return createClientComponentClient({
    supabaseUrl: url,
    supabaseKey: key,
  });
}

// Check for valid environment
function checkEnvironment() {
  const hasValidCredentials = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'dummy-key-for-build';
  
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured. Please set environment variables.');
  }
}

// Storage bucket configuration
const STORAGE_CONFIG = {
  bucketName: "funeral-pdfs",
  maxFileSize: 50 * 1024 * 1024, // 50MB (increased from 10MB)
  allowedMimeTypes: ["application/pdf"],
  
  // Public access settings
  public: true,
  
  // File naming convention - use general folder for all uploads to avoid RLS issues
  getFileName: (originalName: string, funeralId?: string) => {
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    // Use general folder for all uploads to avoid RLS path restrictions
    return `general/${timestamp}_${safeName}`;
  }
};

/**
 * Initialize the storage bucket (check if it exists)
 */
export async function initializePdfBucket() {
  try {
    checkEnvironment();
    const supabase = createSupabaseClient();
    
    // Just check if bucket exists, don't try to create it
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn("Could not check bucket existence (this is normal for non-admin users):", listError.message);
      // Continue anyway - the bucket might exist but we don't have permissions to list buckets
      return true;
    }

    const bucketExists = buckets?.some((bucket: any) => bucket.name === STORAGE_CONFIG.bucketName);

    if (!bucketExists) {
      console.warn(`Bucket '${STORAGE_CONFIG.bucketName}' not found. It may need to be created manually in the Supabase dashboard.`);
      // Don't try to create it here as it requires admin permissions
      return false;
    }

    console.log(`PDF bucket '${STORAGE_CONFIG.bucketName}' is available`);
    return true;
  } catch (error) {
    console.warn("Error checking PDF bucket (this is normal for non-admin users):", error);
    // Return true to continue - the bucket might exist but we don't have permissions to check
    return true;
  }
}

/**
 * Upload PDF to Supabase Storage
 */
export async function uploadPdfToSupabase(
  file: File, 
  funeralId?: string
): Promise<{
  url: string;
  path: string;
  publicUrl: string;
}> {
  // Check environment first
  checkEnvironment();
  const supabase = createSupabaseClient();
  
  // Validate file
  if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.type)) {
    throw new Error("Only PDF files are allowed");
  }

  if (file.size > STORAGE_CONFIG.maxFileSize) {
    throw new Error(`File size must be less than ${STORAGE_CONFIG.maxFileSize / 1024 / 1024}MB`);
  }

  // Generate file path
  const filePath = STORAGE_CONFIG.getFileName(file.name, funeralId);

  try {
    // Diagnostic: log current user (helps with RLS debugging)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn('Supabase auth getUser error (non-fatal for storage upload):', userError.message);
      } else {
        console.log('Uploading PDF as user:', user?.id || 'anonymous');
      }
    } catch (e) {
      console.warn('Could not fetch user before upload (continuing):', (e as Error).message);
    }

    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // Enhance RLS error clarity
      if (/row-level security/i.test(error.message)) {
        throw new Error(
          'Upload failed due to Storage RLS. Apply storage policies (see docs/STORAGE_RLS_FIX.md) to allow INSERT on bucket "funeral-pdfs" for authenticated users.'
        );
      }
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_CONFIG.bucketName)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error("PDF upload failed:", error);
    throw error;
  }
}

/**
 * Delete PDF from Supabase Storage
 */
export async function deletePdfFromSupabase(filePath: string): Promise<boolean> {
  try {
    checkEnvironment();
    const supabase = createSupabaseClient();
    
    const { error } = await supabase.storage
      .from(STORAGE_CONFIG.bucketName)
      .remove([filePath]);

    if (error) {
      console.error("Delete failed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return false;
  }
}

/**
 * List all PDFs for a funeral
 */
export async function listFuneralPdfs(funeralId: string) {
  try {
    checkEnvironment();
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucketName)
      .list(`funeral_${funeralId}/`);

    if (error) {
      throw error;
    }

    return data?.map((file: any) => ({
      name: file.name,
      path: `funeral_${funeralId}/${file.name}`,
      url: supabase.storage
        .from(STORAGE_CONFIG.bucketName)
        .getPublicUrl(`funeral_${funeralId}/${file.name}`).data.publicUrl,
      size: file.metadata?.size,
      lastModified: file.updated_at
    })) || [];
  } catch (error) {
    console.error("Error listing PDFs:", error);
    return [];
  }
}

export { STORAGE_CONFIG };
