// Cloudinary upload utility
const CLOUDINARY_CLOUD_NAME = "dyfr1ppe8";
const CLOUDINARY_UPLOAD_PRESET = "website-cursor";
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

// Helper functions for Cloudinary PDFs
function convertRawToDownloadUrl(rawUrl: string): string {
  if (!rawUrl || !rawUrl.includes('cloudinary.com') || !rawUrl.includes('/raw/upload/')) {
    return rawUrl;
  }
  // Convert the raw URL to a public download URL
  return rawUrl.replace('/raw/upload/', '/image/upload/fl_attachment/');
}

// Store URL in localStorage if in browser environment
function storeUrlMapping(rawUrl: string, downloadUrl: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const fallbackUrls = localStorage.getItem('pdf_fallback_urls') || '{}';
    const urlMap = JSON.parse(fallbackUrls);
    urlMap[rawUrl] = downloadUrl;
    localStorage.setItem('pdf_fallback_urls', JSON.stringify(urlMap));
  } catch (e) {
    console.warn('Failed to store URL mapping:', e);
  }
}

export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "raw" = "image"
): Promise<string> {
  console.log(`Starting upload to Cloudinary:`, {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    resourceType,
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  // For PDF files, use a special upload preset that creates public files
  if (resourceType === "raw" && file.type === "application/pdf") {
    console.log("PDF file detected, using special upload handling");
    // Add parameters for public access
    formData.append("public_id", `pdf_${Date.now()}`);
    formData.append("resource_type", "image"); // Upload as image type for better access
    formData.append("format", "pdf"); // Keep as PDF format
  }

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
    console.log(`Uploading to URL: ${uploadUrl}`);

    const res = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log(`Upload response status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Cloudinary upload failed:", {
        status: res.status,
        statusText: res.statusText,
        errorText
      });
      throw new Error(`Upload failed: ${res.statusText}. ${errorText}`);
    }

    const data = await res.json();
    console.log("Upload successful:", {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      bytes: data.bytes
    });

    if (!data.secure_url) {
      console.error("Upload succeeded but no URL was returned:", data);
      throw new Error("Upload succeeded but no URL was returned.");
    }

    // If this is a raw file (like PDF), store the URL in local storage
    // and create a more accessible URL
    if (resourceType === "raw" && data.secure_url) {
      // For PDFs, we store the raw URL and the download URL mapping
      try {
        // Convert the URL from raw to a public download URL
        // This helps avoid authentication issues with direct raw access
        const downloadUrl = convertRawToDownloadUrl(data.secure_url);
        
        // Store the mapping in local storage
        storeUrlMapping(data.secure_url, downloadUrl);
        
        // Return the download URL directly instead of the raw URL
        // This ensures PDFs are immediately accessible
        return downloadUrl;
      } catch (e) {
        console.warn('Failed to create fallback URL:', e);
        return data.secure_url;
      }
    }

    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred during upload");
  }
}

export async function uploadMultipleToCloudinary(
  files: FileList,
  resourceType: "image" | "raw" = "image"
): Promise<string[]> {
  console.log(`Starting batch upload of ${files.length} files to Cloudinary`);
  
  const uploadPromises = Array.from(files).map(file => 
    uploadToCloudinary(file, resourceType)
  );
  
  try {
    const urls = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${urls.length} files`);
    return urls;
  } catch (error) {
    console.error("Batch upload failed:", error);
    throw error;
  }
}
