/**
 * Utility functions for working with Cloudinary URLs
 */

/**
 * Converts a Cloudinary raw URL to a download URL
 * This helps avoid authentication issues with direct raw access
 * 
 * @param rawUrl The original Cloudinary raw URL
 * @returns A public download URL for the same resource
 */
export function convertRawToDownloadUrl(rawUrl: string): string {
  // Check if this is a Cloudinary raw URL
  if (!rawUrl || !rawUrl.includes('cloudinary.com') || !rawUrl.includes('/raw/upload/')) {
    return rawUrl;
  }
  // We must KEEP the resource type as "raw". Previous implementation incorrectly
  // swapped to image/upload leading to 404s (since PDF stored as raw asset).
  // Correct form: /raw/upload/fl_attachment/... (only add flag if not already there)
  if (rawUrl.includes('/raw/upload/fl_attachment/')) return rawUrl; // already transformed
  return rawUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
}

/**
 * Stores a mapping between a raw URL and its download URL
 * 
 * @param rawUrl The original Cloudinary raw URL
 * @param downloadUrl The corresponding download URL
 */
export function storeUrlMapping(rawUrl: string, downloadUrl: string): void {
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

/**
 * Gets the download URL for a raw URL from stored mappings
 * 
 * @param rawUrl The original Cloudinary raw URL
 * @returns The mapped download URL or the original URL if no mapping exists
 */
export function getDownloadUrl(rawUrl: string): string {
  if (!rawUrl || typeof window === 'undefined') return rawUrl;
  
  try {
    // First, check if we have a mapping in localStorage
    const fallbackUrls = localStorage.getItem('pdf_fallback_urls');
    if (fallbackUrls) {
      const urlMap = JSON.parse(fallbackUrls);
      if (urlMap[rawUrl]) {
        return urlMap[rawUrl];
      }
    }
    
    // If no mapping found, and this is a raw URL, generate a download URL
    if (isCloudinaryRawUrl(rawUrl)) {
      const downloadUrl = convertRawToDownloadUrl(rawUrl);
      storeUrlMapping(rawUrl, downloadUrl);
      return downloadUrl;
    }
    
    return rawUrl;
  } catch (e) {
    console.warn('Failed to retrieve URL mapping:', e);
    return rawUrl;
  }
}

/**
 * Checks if a URL is a Cloudinary raw URL that might need authentication
 * 
 * @param url The URL to check
 * @returns True if the URL is a Cloudinary raw URL
 */
export function isCloudinaryRawUrl(url: string): boolean {
  return !!url && url.includes('cloudinary.com') && url.includes('/raw/upload/');
}

/**
 * Directly get a public URL for a Cloudinary resource
 * This ensures PDFs are accessible regardless of client-side storage
 * 
 * @param url Any URL, potentially a Cloudinary URL
 * @returns A public access URL if it's a Cloudinary URL, otherwise the original URL
 */
export function getPublicPdfUrl(url: string): string {
  if (isCloudinaryRawUrl(url)) {
    return convertRawToDownloadUrl(url);
  }
  return url;
}
