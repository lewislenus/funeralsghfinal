# Smart PDF Storage Implementation

This document describes the implementation of smart PDF storage that automatically selects the appropriate storage provider based on file size, utilizing your existing Supabase `funeral-pdfs` bucket.

## Overview

The system now intelligently handles PDF storage by:
- Using **Cloudinary** for files ≤ 10MB (with compression if needed)
- Using **Supabase `funeral-pdfs` bucket** for files > 10MB (up to 50MB)
- Automatic compression attempts for files over 10MB to try using Cloudinary first
- Fallback mechanisms if primary storage fails

## Supabase Bucket Configuration

Your `funeral-pdfs` bucket is configured as:
- **Bucket Name**: `funeral-pdfs`
- **Access**: Public (as shown in your Supabase dashboard)
- **Max File Size**: 50MB
- **File Organization**: 
  - `funeral_{funeralId}/` - PDFs for specific funerals
  - `general/` - General uploads

## Key Features

### 1. Automatic Provider Selection
- Files ≤ 10MB → Cloudinary (faster processing, thumbnail generation)
- Files > 10MB → Supabase (larger file support, cost-effective)

### 2. Smart Compression
- Files over 10MB are automatically compressed
- If compression reduces size to ≤ 10MB, uses Cloudinary
- If compression fails or file remains large, uses Supabase

### 3. Fallback Support
- If primary provider fails, automatically tries fallback providers
- Ensures high reliability and uptime

## Configuration

```typescript
const PDF_STORAGE_CONFIG = {
  sizeThresholdMB: 10,           // Threshold for provider selection
  smallFileProvider: 'cloudinary', // Provider for small files
  largeFileProvider: 'supabase',   // Provider for large files
  cloudinaryMaxSize: 10 * 1024 * 1024,  // 10MB
  supabaseMaxSize: 50 * 1024 * 1024,    // 50MB
};
```

## Usage

### Basic Upload (Recommended)
```typescript
import { uploadPdfSmart } from '@/lib/pdf-storage-manager';

const result = await uploadPdfSmart(file, funeralId);
console.log(`Uploaded to: ${result.provider}`);
console.log(`URL: ${result.url}`);
```

### Get Storage Information
```typescript
import { getStorageInfo } from '@/lib/pdf-storage-manager';

const info = getStorageInfo(file);
console.log(`File size: ${info.fileSizeMB}MB`);
console.log(`Recommended provider: ${info.recommendedProvider}`);
console.log(`Needs compression: ${info.needsCompression}`);
```

### Manual Provider Selection
```typescript
import { uploadPdf } from '@/lib/pdf-storage-manager';

const result = await uploadPdf(file, funeralId);
// Uses size-based provider selection but no automatic compression
```

## Storage Providers

### Cloudinary
- **Best for**: Small files (≤ 10MB)
- **Features**: Automatic thumbnail generation, fast CDN, image transformations
- **Limits**: 10MB max file size
- **Use cases**: Most funeral brochures, quick preview generation

### Supabase
- **Best for**: Large files (> 10MB)
- **Features**: Cost-effective, larger file support, integrated with database
- **Limits**: 50MB max file size
- **Bucket**: `funeral-pdfs` (public access)
- **Use cases**: High-resolution brochures, detailed memorial documents

## Testing Storage Setup

You can test your Supabase storage configuration:

```typescript
import { runStorageTests } from '@/lib/test-supabase-storage';

// Run comprehensive storage tests
await runStorageTests();
```

This will verify:
- Bucket accessibility
- Upload permissions
- Public URL generation
- File organization

## File Size Handling

### Size Thresholds
- **0-10MB**: Cloudinary (with thumbnails)
- **10-50MB**: Supabase (cost-effective storage)
- **>50MB**: Rejected with error message

### Compression Strategy
1. Files > 10MB trigger compression attempt
2. Compression targets 80% quality with metadata removal
3. If compressed file ≤ 10MB → Cloudinary
4. If compression fails or file remains large → Supabase

## Error Handling

The system provides comprehensive error handling:
- Invalid file types
- File size exceeded
- Storage provider failures
- Network issues
- Compression failures

## Monitoring

All uploads log:
- Original file size
- Provider selection reasoning
- Compression results (if applicable)
- Final storage provider used
- Upload success/failure

## Benefits

1. **Cost Optimization**: Uses appropriate provider for file size
2. **Performance**: Cloudinary for fast processing, Supabase for large files
3. **Reliability**: Automatic fallbacks ensure high uptime
4. **User Experience**: Transparent file size handling
5. **Scalability**: Handles files from KB to 50MB efficiently

## Migration Notes

- Existing uploads continue to work normally
- New uploads automatically use smart routing
- No breaking changes to existing API
- Backward compatible with existing brochure storage
