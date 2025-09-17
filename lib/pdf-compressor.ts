import { PDFDocument } from 'pdf-lib';

export interface CompressionOptions {
  maxSizeMB?: number;
  quality?: number;
  removeMetadata?: boolean;
  removeAnnotations?: boolean;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeMB: 10,
  quality: 0.8,
  removeMetadata: true,
  removeAnnotations: true,
};

/**
 * Compresses a PDF file if it exceeds the specified size limit
 */
export async function compressPdfIfNeeded(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const maxSizeBytes = opts.maxSizeMB * 1024 * 1024;
  
  const originalSize = file.size;
  
  // If file is already under the limit, return as-is
  if (originalSize <= maxSizeBytes) {
    return {
      compressedFile: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      wasCompressed: false,
    };
  }

  try {
    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Remove metadata if requested
    if (opts.removeMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setCreator('');
      pdfDoc.setProducer('');
      pdfDoc.setKeywords([]);
    }

    // Remove annotations if requested
    if (opts.removeAnnotations) {
      const pages = pdfDoc.getPages();
      pages.forEach((page: any) => {
        const annotations = page.node.Annots();
        if (annotations) {
          page.node.delete('Annots');
        }
      });
    }

    // Start with the specified quality and reduce if needed
    let quality = opts.quality;
    let compressedBytes: Uint8Array;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      attempts++;
      
      // Save with current quality settings
      compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });

      // If still too large and we have more attempts, reduce quality
      if (compressedBytes.length > maxSizeBytes && attempts < maxAttempts) {
        quality *= 0.8; // Reduce quality by 20% each attempt
        
        // Try to compress images in the PDF (basic approach)
        // Note: More advanced image compression would require additional libraries
        const pages = pdfDoc.getPages();
        
        // This is a simplified approach - in a production environment,
        // you might want to use more sophisticated image compression
        for (const page of pages) {
          try {
            // Scale down the page slightly to reduce file size
            const { width, height } = page.getSize();
            const scaleFactor = Math.min(1, Math.sqrt(maxSizeBytes / compressedBytes.length));
            
            if (scaleFactor < 1) {
              page.scaleContent(scaleFactor, scaleFactor);
              page.setSize(width * scaleFactor, height * scaleFactor);
            }
          } catch (error) {
            // Continue if page scaling fails
            console.warn('Failed to scale page:', error);
          }
        }
      }
    } while (compressedBytes.length > maxSizeBytes && attempts < maxAttempts);

    const compressedSize = compressedBytes.length;
    
    // Create a new File object from the compressed data
    const compressedFile = new File(
      [new Uint8Array(compressedBytes)],
      file.name.replace(/\.pdf$/i, '_compressed.pdf'),
      { type: 'application/pdf' }
    );

    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio: compressedSize / originalSize,
      wasCompressed: true,
    };

  } catch (error) {
    console.error('PDF compression failed:', error);
    
    // If compression fails, return original file if it's not too large
    // or throw an error if it is too large
    if (originalSize <= maxSizeBytes) {
      return {
        compressedFile: file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        wasCompressed: false,
      };
    }
    
    throw new Error(`PDF compression failed and file size (${(originalSize / 1024 / 1024).toFixed(2)}MB) exceeds limit (${opts.maxSizeMB}MB)`);
  }
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates if a file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Gets the file size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}
