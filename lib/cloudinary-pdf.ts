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
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  
  // Enhanced PDF upload parameters
  formData.append("resource_type", "image"); // Use 'image' for better access
  formData.append("format", "pdf");
  formData.append("public_id", `pdfs/funeral_${Date.now()}`);
  formData.append("access_mode", "public");
  formData.append("type", "upload");
  
  // Add flags for better handling
  formData.append("flags", "attachment,immutable_cache");
  
  // Generate thumbnails
  formData.append("eager", JSON.stringify([
    { width: 300, height: 400, crop: "fit", format: "jpg", page: 1 },
    { width: 150, height: 200, crop: "fit", format: "jpg", page: 1 }
  ]));

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      thumbnailUrls: data.eager?.map((eager: any) => eager.secure_url) || [],
      directDownloadUrl: `${data.secure_url}?fl_attachment`
    };
  } catch (error) {
    console.error("PDF upload failed:", error);
    throw error;
  }
}

export { CLOUDINARY_CONFIG };
