/**
 * Enhanced Cloudinary PDF Storage Configuration
 * 
 * This setup ensures PDFs are stored with maximum accessibility
 */

// Enhanced Cloudinary configuration for PDFs
const CLOUDINARY_CONFIG = {
  cloudName: "dyfr1ppe8",
  uploadPreset: "website-cursor", // Your existing preset
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  
  // PDF-specific settings
  pdfSettings: {
    // Upload as 'image' type with PDF format for better public access
    resourceType: "image",
    format: "pdf",
    
    // Ensure public access
    type: "upload",
    access_mode: "public",
    
    // Add flags for immediate availability
    flags: ["attachment", "immutable_cache"],
    
    // Quality settings for PDFs
    quality: "auto:best",
    
    // Generate thumbnails automatically
    eager: [
      { width: 300, height: 400, crop: "fit", format: "jpg", page: 1 }, // First page thumbnail
      { width: 150, height: 200, crop: "fit", format: "jpg", page: 1 }  // Small thumbnail
    ]
  }
};

/**
 * Upload PDF to Cloudinary with enhanced accessibility
 */
export async function uploadPdfToCloudinary(file: File): Promise<{
  url: string;
  publicId: string;
  thumbnailUrls: string[];
  directDownloadUrl: string;
}> {
  console.log('Starting PDF upload to Cloudinary:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  
  // Enhanced PDF upload parameters - use image resource type for better accessibility
  const publicId = `pdfs/funeral_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  formData.append("resource_type", "image");
  formData.append("format", "pdf");
  formData.append("public_id", publicId);
  formData.append("access_mode", "public");
  formData.append("type", "upload");
  
  // Add flags for better handling
  formData.append("flags", "attachment,immutable_cache");
  
  // Generate thumbnails (Cloudinary expects transformation strings, not JSON)
  // We'll request thumbnails for first page in two sizes
  // Format: w_300,h_400,c_fit,pg_1/format/jpg
  const eager = [
    'w_300,h_400,c_fit,pg_1/format/jpg',
    'w_150,h_200,c_fit,pg_1/format/jpg'
  ].join('|');
  formData.append('eager', eager);

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    console.log('Uploading PDF to:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log('Upload response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary upload failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Upload failed: ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    console.log('PDF upload successful:', {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      bytes: data.bytes,
      eager_count: data.eager?.length || 0
    });

    if (!data.secure_url) {
      throw new Error("Upload succeeded but no URL was returned");
    }
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      thumbnailUrls: data.eager?.map((eager: any) => eager.secure_url) || [],
      directDownloadUrl: `${data.secure_url}?fl_attachment`
    };
  } catch (error) {
    console.error("PDF upload error:", error);
    throw error instanceof Error ? error : new Error("Unknown upload error");
  }
}

/**
 * Alternative upload method using raw resource type (fallback)
 */
export async function uploadPdfToCloudinaryRaw(file: File): Promise<{
  url: string;
  publicId: string;
  thumbnailUrls: string[];
  directDownloadUrl: string;
}> {
  console.log('Starting PDF upload to Cloudinary (raw mode):', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  
  const publicId = `pdfs/funeral_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  formData.append("public_id", publicId);
  formData.append("resource_type", "raw");

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/raw/upload`;
    console.log('Uploading PDF (raw) to:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary raw upload failed:", errorText);
      throw new Error(`Raw upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('PDF raw upload successful:', data);

    return {
      url: data.secure_url,
      publicId: data.public_id,
      thumbnailUrls: [],
      directDownloadUrl: data.secure_url
    };
  } catch (error) {
    console.error("PDF raw upload error:", error);
    throw error instanceof Error ? error : new Error("Unknown raw upload error");
  }
}

/**
 * Upload PDF with automatic fallback between methods
 */
export async function uploadPdfWithFallback(file: File): Promise<{
  url: string;
  publicId: string;
  thumbnailUrls: string[];
  directDownloadUrl: string;
}> {
  try {
    // Try primary method first (image resource type with PDF format)
    return await uploadPdfToCloudinary(file);
  } catch (error) {
    console.warn('Primary PDF upload failed, trying raw upload:', error);
    try {
      // Fallback to raw upload
      return await uploadPdfToCloudinaryRaw(file);
    } catch (fallbackError) {
      console.error('Both upload methods failed:', { primary: error, fallback: fallbackError });
      throw new Error(`PDF upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export { CLOUDINARY_CONFIG };
