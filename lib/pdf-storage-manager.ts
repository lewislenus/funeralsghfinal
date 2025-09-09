/**
 * Unified PDF Storage Manager
 * 
 * This allows you to easily switch between storage providers
 * or use multiple providers simultaneously
 */

import { uploadPdfToSupabase, initializePdfBucket } from './supabase-storage';
import { uploadPdfToCloudinary } from './cloudinary-pdf';

export type StorageProvider = 'supabase' | 'cloudinary';

export interface PdfUploadResult {
  url: string;
  provider: StorageProvider;
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
  // Primary provider (change this to switch default storage)
  primaryProvider: 'supabase' as StorageProvider,
  
  // Fallback providers (will try these if primary fails)
  fallbackProviders: ['cloudinary'] as StorageProvider[],
  
  // Whether to store in multiple providers for redundancy
  useRedundancy: false,
  
  // Maximum file size (10MB)
  maxFileSize: 10 * 1024 * 1024,
  
  // Allowed MIME types
  allowedTypes: ['application/pdf']
};

/**
 * Initialize storage providers
 */
export async function initializePdfStorage(): Promise<void> {
  console.log('Initializing PDF storage...');
  
  // Initialize Supabase bucket if needed
  if (PDF_STORAGE_CONFIG.primaryProvider === 'supabase' || 
      PDF_STORAGE_CONFIG.fallbackProviders.includes('supabase')) {
    await initializePdfBucket();
  }
  
  console.log('PDF storage initialized successfully');
}

/**
 * Validate PDF file
 */
function validatePdfFile(file: File): void {
  if (!PDF_STORAGE_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error('Only PDF files are allowed');
  }
  
  if (file.size > PDF_STORAGE_CONFIG.maxFileSize) {
    throw new Error(`File size must be less than ${PDF_STORAGE_CONFIG.maxFileSize / 1024 / 1024}MB`);
  }
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
      const cloudinaryResult = await uploadPdfToCloudinary(file);
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
 * Upload PDF with automatic fallback
 */
export async function uploadPdf(
  file: File,
  funeralId?: string
): Promise<PdfUploadResult> {
  validatePdfFile(file);
  
  const providers = [
    PDF_STORAGE_CONFIG.primaryProvider,
    ...PDF_STORAGE_CONFIG.fallbackProviders
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
  validatePdfFile(file);
  
  const providers = [
    PDF_STORAGE_CONFIG.primaryProvider,
    ...PDF_STORAGE_CONFIG.fallbackProviders
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

export { PDF_STORAGE_CONFIG };
