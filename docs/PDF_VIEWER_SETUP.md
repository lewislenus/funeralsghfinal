# PDF Viewer Configuration Guide

This document describes the setup and configuration of the PDF.js viewer in the Funeral Portal application.

## Overview

The application uses PDF.js (version 4.8.69) to display funeral brochures and documents. PDF.js requires a "worker" script to handle PDF rendering in a separate thread, which prevents the main UI from freezing during complex PDF operations.

## Problem Resolution

### Issue

The PDF viewer was failing with the error: "No GlobalWorkerOptions.workerSrc specified" or "Failed to fetch dynamically imported module" when trying to load PDFs. This happened because:

1. PDF.js 4.8.69 worker files weren't properly available on the CDN
2. The worker script wasn't correctly configured to work in Next.js environments

### Solution

We implemented a robust solution with the following components:

1. **Self-hosted Worker File**: Instead of relying on external CDNs, we now copy the PDF.js worker file from node_modules to the public directory during build and development processes.

2. **Worker Configuration Utility**: Created a utility function in `lib/pdf-utils.ts` that configures the PDF.js worker with proper paths.

3. **Build Process Integration**: Added the worker file copy script to both development and build processes in package.json.

## Implementation Details

### 1. Worker Copy Script

Located at `scripts/copy-pdf-worker.js`, this script:
- Recursively searches for PDF.js worker files in node_modules
- Selects the appropriate worker file (pdf.worker.mjs)
- Copies it to the public directory as pdf.worker.js

### 2. PDF.js Utility

Located at `lib/pdf-utils.ts`, this module provides:
- `configurePdfWorker()`: Sets up the PDF.js worker path
- `loadPdf()`: Safely loads a PDF with proper error handling

### 3. Package.json Configuration

The package.json scripts ensure the worker file is copied:
```json
"scripts": {
  "build": "next build",
  "prebuild": "node scripts/copy-pdf-worker.js",
  "dev": "node scripts/copy-pdf-worker.js && next dev",
  // ...
}
```

## Usage

When implementing PDF viewing in a component:

1. Import the necessary utilities:
```typescript
import { configurePdfWorker, loadPdf } from "@/lib/pdf-utils";
```

2. Configure the worker when the component mounts:
```typescript
useEffect(() => {
  configurePdfWorker();
}, []);
```

3. Load the PDF using the utility function:
```typescript
const result = await loadPdf(pdfUrl);
if ('error' in result) {
  // Handle error
} else {
  const { pdf, numPages } = result;
  // Render PDF
}
```

## Testing

You can test the PDF viewer functionality using the `/test-pdf` page, which:
- Shows the current PDF.js version
- Displays the worker configuration status
- Allows testing with sample PDFs
- Renders PDFs using the FlipbookViewer component

## Troubleshooting

If you encounter PDF loading issues:

1. Check that the `public/pdf.worker.js` file exists
2. Verify that the copy-pdf-worker.js script ran successfully
3. Test with the `/test-pdf` page to view detailed error information
4. Check browser console for any CORS or network-related errors

## Future Improvements

1. Consider adding version checking to ensure the worker file matches the PDF.js library version
2. Add more robust error handling and recovery options
3. Implement caching strategies for frequently viewed PDFs
