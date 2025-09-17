/**
 * Unified PDF Storage Manager
 * 
 * This allows you to easily switch between storage providers
 * or use multiple providers simultaneously
 */

import { uploadPdfToSupabase, initializePdfBucket } from './supabase-storage';
import { uploadPdfWithFallback } from './cloudinary-pdf';
import { compressPdfIfNeeded, type CompressionResult } from './pdf-compressor';

export type StorageProvider = 'supabase' | 'cloudinary';

export interface PdfUploadResult {
  url: string;
  provider: StorageProvider;
  compressionInfo?: CompressionResult;
  metadata?: {
    path?: string;
    publicId?: string;
    thumbnails?: string[];
    size?: number;
  };
}

/**
 * Configuration for PDF storage
 */
const PDF_STORAGE_CONFIG = {
  // File size threshold for storage provider selection (10MB)
  sizeThresholdMB: 10,
  
  // Provider for files below threshold
  smallFileProvider: 'cloudinary' as StorageProvider,
  
  // Provider for files above threshold
  largeFileProvider: 'supabase' as StorageProvider,
  
  // Fallback providers (will try these if primary fails)
  fallbackProviders: ['cloudinary', 'supabase'] as StorageProvider[],
  
  // Whether to store in multiple providers for redundancy
  useRedundancy: false,
  
  // Maximum file size for Cloudinary (10MB)
  cloudinaryMaxSize: 10 * 1024 * 1024,
  
  // Maximum file size for Supabase (50MB - can handle larger files)
  supabaseMaxSize: 50 * 1024 * 1024,
  
  // Allowed MIME types
  allowedTypes: ['application/pdf']
};

/**
 * Initialize storage providers
 */
export async function initializePdfStorage(): Promise<void> {
  console.log('Initializing PDF storage...');
  
  // Initialize Supabase bucket if needed
  if (PDF_STORAGE_CONFIG.largeFileProvider === 'supabase' || 
      PDF_STORAGE_CONFIG.fallbackProviders.includes('supabase')) {
    await initializePdfBucket();
  }
  
  console.log('PDF storage initialized successfully');
}

/**
 * Validate PDF file and determine appropriate storage provider
 */
function validatePdfFile(file: File): { provider: StorageProvider; maxSize: number } {
  if (!PDF_STORAGE_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error('Only PDF files are allowed');
  }
  
  const fileSizeMB = file.size / (1024 * 1024);
  
  // Determine which provider to use based on file size
  const useSupabase = fileSizeMB > PDF_STORAGE_CONFIG.sizeThresholdMB;
  const provider = useSupabase ? PDF_STORAGE_CONFIG.largeFileProvider : PDF_STORAGE_CONFIG.smallFileProvider;
  const maxSize = useSupabase ? PDF_STORAGE_CONFIG.supabaseMaxSize : PDF_STORAGE_CONFIG.cloudinaryMaxSize;
  
  if (file.size > maxSize) {
    throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size for ${provider} (${maxSize / 1024 / 1024}MB)`);
  }
  
  return { provider, maxSize };
}

/**
 * Upload PDF to a specific provider
 */
async function uploadToProvider(
  file: File, 
  provider: StorageProvider,
  funeralId?: string
): Promise<PdfUploadResult> {
  switch (provider) {
    case 'supabase':
      const supabaseResult = await uploadPdfToSupabase(file, funeralId);
      return {
        url: supabaseResult.url,
        provider: 'supabase',
        metadata: {
          path: supabaseResult.path,
          size: file.size
        }
      };
    
    case 'cloudinary':
      // Guard: never attempt Cloudinary if file exceeds its maximum configured size
      if (file.size > PDF_STORAGE_CONFIG.cloudinaryMaxSize) {
        throw new Error(`File exceeds Cloudinary max size (${(PDF_STORAGE_CONFIG.cloudinaryMaxSize/1024/1024).toFixed(0)}MB), skipping Cloudinary`);
      }
      const cloudinaryResult = await uploadPdfWithFallback(file);
      return {
        url: cloudinaryResult.url,
        provider: 'cloudinary',
        metadata: {
          publicId: cloudinaryResult.publicId,
          thumbnails: cloudinaryResult.thumbnailUrls,
          size: file.size
        }
      };
    
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

/**
 * Smart PDF upload with automatic compression and provider selection
 */
export async function uploadPdfSmart(
  file: File,
  funeralId?: string
): Promise<PdfUploadResult> {
  const fileSizeMB = file.size / (1024 * 1024);
  
  console.log(`Original file size: ${fileSizeMB.toFixed(2)}MB`);
  
  let finalFile = file;
  let compressionInfo: CompressionResult | undefined;
  
  // If file is over 10MB, try compression first to see if we can use Cloudinary
  if (fileSizeMB > PDF_STORAGE_CONFIG.sizeThresholdMB) {
    try {
      console.log('File is over 10MB, attempting compression...');
      compressionInfo = await compressPdfIfNeeded(file, {
        maxSizeMB: PDF_STORAGE_CONFIG.sizeThresholdMB,
        quality: 0.8,
        removeMetadata: true,
        removeAnnotations: true
      });
      
      finalFile = compressionInfo.compressedFile;
      const compressedSizeMB = finalFile.size / (1024 * 1024);
      
      console.log(`Compressed file size: ${compressedSizeMB.toFixed(2)}MB`);
      console.log(`Compression ratio: ${(compressionInfo.compressionRatio * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.warn('Compression failed, proceeding with original file:', error);
      compressionInfo = undefined;
    }
  }
  
  // Determine provider based on final file size
  const { provider: primaryProvider } = validatePdfFile(finalFile);
  
  console.log(`Using ${primaryProvider} storage for final file size: ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`);
  
  // Create provider list with primary provider first, then fallbacks
  const providers = [
    primaryProvider,
    ...PDF_STORAGE_CONFIG.fallbackProviders.filter(p => {
      if (p === primaryProvider) return false;
      // Exclude Cloudinary from fallback list if file (post-compression) still exceeds its limit
      if (p === 'cloudinary' && finalFile.size > PDF_STORAGE_CONFIG.cloudinaryMaxSize) return false;
      return true;
    })
  ];
  
  let lastError: Error | null = null;
  
  for (const provider of providers) {
    try {
      console.log(`Attempting to upload PDF to ${provider}...`);
      const result = await uploadToProvider(finalFile, provider, funeralId);
      console.log(`Successfully uploaded PDF to ${provider}:`, result.url);
      
      return {
        ...result,
        compressionInfo,
        metadata: {
          ...result.metadata,
          size: finalFile.size
        }
      };
    } catch (error) {
      console.warn(`Upload to ${provider} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  throw new Error(`All storage providers failed. Last error: ${lastError?.message}`);
}

/**
 * Upload PDF with automatic provider selection based on file size (legacy function)
 */
export async function uploadPdf(
  file: File,
  funeralId?: string
): Promise<PdfUploadResult> {
  const { provider: primaryProvider } = validatePdfFile(file);
  
  const fileSizeMB = file.size / (1024 * 1024);
  
  console.log(`File size: ${fileSizeMB.toFixed(2)}MB, using ${primaryProvider} storage`);
  
  // Create provider list with primary provider first, then fallbacks
  const providers = [
    primaryProvider,
    ...PDF_STORAGE_CONFIG.fallbackProviders.filter(p => {
      if (p === primaryProvider) return false;
      if (p === 'cloudinary' && file.size > PDF_STORAGE_CONFIG.cloudinaryMaxSize) return false;
      return true;
    })
  ];
  
  let lastError: Error | null = null;
  
  for (const provider of providers) {
    try {
      console.log(`Attempting to upload PDF to ${provider}...`);
      const result = await uploadToProvider(file, provider, funeralId);
      console.log(`Successfully uploaded PDF to ${provider}:`, result.url);
      return result;
    } catch (error) {
      console.warn(`Upload to ${provider} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }
  
  throw new Error(`All storage providers failed. Last error: ${lastError?.message}`);
}

/**
 * Upload PDF with redundancy (multiple providers)
 */
export async function uploadPdfWithRedundancy(
  file: File,
  funeralId?: string
): Promise<PdfUploadResult[]> {
  const { provider: primaryProvider } = validatePdfFile(file);
  
  // Use both providers for redundancy
  const providers = [
    primaryProvider,
    ...PDF_STORAGE_CONFIG.fallbackProviders.filter(p => p !== primaryProvider)
  ];
  
  const results: PdfUploadResult[] = [];
  const errors: Error[] = [];
  
  for (const provider of providers) {
    try {
      const result = await uploadToProvider(file, provider, funeralId);
      results.push(result);
      console.log(`Successfully uploaded PDF to ${provider}`);
    } catch (error) {
      console.warn(`Upload to ${provider} failed:`, error);
      errors.push(error as Error);
    }
  }
  
  if (results.length === 0) {
    throw new Error(`All uploads failed: ${errors.map(e => e.message).join(', ')}`);
  }
  
  return results;
}

/**
 * Get the best PDF URL for display
 */
export function getBestPdfUrl(results: PdfUploadResult[]): string {
  // Priority order: Supabase > Cloudinary
  const priority = ['supabase', 'cloudinary'];
  
  for (const provider of priority) {
    const result = results.find(r => r.provider === provider);
    if (result) {
      return result.url;
    }
  }
  
  return results[0]?.url || '';
}

/**
 * Update storage configuration
 */
export function configurePdfStorage(config: Partial<typeof PDF_STORAGE_CONFIG>): void {
  Object.assign(PDF_STORAGE_CONFIG, config);
}

/**
 * Get storage information for a file
 */
export function getStorageInfo(file: File): {
  fileSizeMB: number;
  recommendedProvider: StorageProvider;
  needsCompression: boolean;
  maxAllowedSize: number;
} {
  const fileSizeMB = file.size / (1024 * 1024);
  const needsCompression = fileSizeMB > PDF_STORAGE_CONFIG.sizeThresholdMB;
  
  let recommendedProvider: StorageProvider;
  let maxAllowedSize: number;
  
  if (fileSizeMB > PDF_STORAGE_CONFIG.sizeThresholdMB) {
    recommendedProvider = PDF_STORAGE_CONFIG.largeFileProvider;
    maxAllowedSize = PDF_STORAGE_CONFIG.supabaseMaxSize;
  } else {
    recommendedProvider = PDF_STORAGE_CONFIG.smallFileProvider;
    maxAllowedSize = PDF_STORAGE_CONFIG.cloudinaryMaxSize;
  }
  
  return {
    fileSizeMB,
    recommendedProvider,
    needsCompression,
    maxAllowedSize
  };
}

/**
 * Check if file can be stored without compression
 */
export function canStoreWithoutCompression(file: File): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= PDF_STORAGE_CONFIG.supabaseMaxSize / (1024 * 1024);
}

export { PDF_STORAGE_CONFIG };
