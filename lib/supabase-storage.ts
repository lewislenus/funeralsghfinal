/**
 * Supabase Storage for PDFs
 * 
 * This provides the most reliable and cost-effective PDF storage
 * with excellent integration to your existing Supabase setup
 */

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

// Storage bucket configuration
const STORAGE_CONFIG = {
  bucketName: "funeral-pdfs",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["application/pdf"],
  
  // Public access settings
  public: true,
  
  // File naming convention
  getFileName: (originalName: string, funeralId?: string) => {
    const timestamp = Date.now();
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return funeralId && funeralId !== 'new-funeral'
      ? `funeral_${funeralId}/${timestamp}_${safeName}`
      : `general/${timestamp}_${safeName}`;
  }
};

/**
 * Initialize the storage bucket (check if it exists)
 */
export async function initializePdfBucket() {
  try {
    // Just check if bucket exists, don't try to create it
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn("Could not check bucket existence (this is normal for non-admin users):", listError.message);
      // Continue anyway - the bucket might exist but we don't have permissions to list buckets
      return true;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_CONFIG.bucketName);

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
    // Upload file
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
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
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.bucketName)
      .list(`funeral_${funeralId}/`);

    if (error) {
      throw error;
    }

    return data?.map(file => ({
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
