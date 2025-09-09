# Flipbook Functionality Documentation

## Overview
The funeral brochure flipbook functionality provides an interactive, book-like viewing experience for PDF documents using PDF.js. This feature allows users to view funeral brochures with realistic page-turning animations and multiple viewing modes.

## Components

### 1. FlipbookViewer (Basic)
- **File**: `components/flipbook-viewer.tsx`
- **Purpose**: Basic PDF viewer with simple page navigation
- **Features**:
  - Single page view
  - Zoom controls
  - Page navigation
  - Download functionality

### 2. EnhancedPdfViewer (Advanced)
- **File**: `components/enhanced-pdf-viewer.tsx`
- **Purpose**: Advanced PDF viewer with multiple view modes
- **Features**:
  - Single page view
  - Double page (side-by-side) view
  - Thumbnail grid view
  - Zoom, rotation, and download controls
  - Fullscreen mode
  - Keyboard navigation

### 3. ImprovedFlipbookViewer (Premium)
- **File**: `components/improved-flipbook-viewer.tsx`
- **Purpose**: Premium flipbook experience with realistic book effects
- **Features**:
  - Single page view
  - Realistic flipbook view with book spine effects
  - Page-turning animations
  - Enhanced visual styling with amber/orange theme
  - Thumbnail grid view
  - Full controls suite

### 4. PdfDisplay (Wrapper)
- **File**: `components/pdf-display.tsx`
- **Purpose**: Unified component for displaying PDFs in different modes
- **Modes**:
  - `preview`: Thumbnail with modal trigger
  - `inline`: Embedded viewer
  - `modal`: Button that opens modal
  - `embed`: Simple iframe fallback
  - `flipbook`: Enhanced flipbook experience

## Usage

### In Funeral Event Pages
```tsx
<PdfDisplay 
  pdfUrl={funeral.brochure_url}
  title="Funeral Brochure"
  description="Memorial service details and tribute information"
  mode="flipbook"
  showThumbnail={true}
/>
```

### Direct Component Usage
```tsx
<ImprovedFlipbookViewer
  pdfUrl="https://example.com/brochure.pdf"
  title="Memorial Service Brochure"
  description="Interactive flipbook viewer"
  showInModal={true}
  autoOpen={false}
/>
```

## View Modes

### 1. Single Page View
- Displays one page at a time
- Best for detailed reading
- Classic PDF viewer experience

### 2. Flipbook View
- Displays two pages side by side like an open book
- Realistic book spine effect
- Page-turning animations
- Enhanced visual appeal

### 3. Thumbnail Grid View
- Shows all pages as small thumbnails
- Quick navigation to any page
- Overview of entire document

## Features

### Navigation Controls
- **Previous/Next buttons**: Navigate through pages
- **Page input**: Jump to specific page
- **Keyboard shortcuts**: Arrow keys, +/- for zoom, Escape to close

### Display Controls
- **Zoom**: 50% to 300% scaling
- **Rotation**: 90-degree increments
- **Fullscreen**: Expand to full screen
- **View mode switcher**: Toggle between single, flipbook, and thumbnail views

### Sharing & Download
- **Download button**: Save PDF locally
- **Share button**: Native sharing (mobile) or copy URL to clipboard

### Visual Enhancements
- **Page-turning animations**: Smooth transitions between pages
- **Book spine effect**: 3D-like appearance for realism
- **Themed styling**: Warm amber/orange color scheme
- **Loading states**: Animated spinners and progress indicators

## Technical Implementation

### PDF.js Configuration
- **Worker setup**: Automatically configures PDF.js worker
- **Error handling**: Graceful fallbacks for loading issues
- **Performance**: Optimized rendering and thumbnail generation

### File Structure
```
components/
├── flipbook-viewer.tsx          # Basic viewer
├── enhanced-pdf-viewer.tsx      # Advanced viewer
├── improved-flipbook-viewer.tsx # Premium flipbook
├── pdf-display.tsx              # Unified wrapper
├── inline-pdf-viewer.tsx        # Inline display
└── ui/                          # Base UI components
```

### Dependencies
- `pdfjs-dist`: PDF rendering engine
- `framer-motion`: Animations and transitions
- `lucide-react`: Icon components
- `@radix-ui/*`: UI primitives

## Testing

### Test Page
Visit `/test-flipbook` to test all flipbook functionality with sample PDFs.

### Test Cases
1. **PDF Loading**: Test with various PDF sources
2. **View Modes**: Switch between single, flipbook, and thumbnail views
3. **Navigation**: Test page navigation in all modes
4. **Controls**: Verify zoom, rotation, and other controls
5. **Responsive**: Test on different screen sizes
6. **Error Handling**: Test with invalid URLs or corrupted PDFs

## Troubleshooting

### Common Issues

#### PDF Worker Not Found
- **Error**: "Setting up fake worker failed"
- **Solution**: Ensure `public/pdf.worker.js` exists
- **Fix**: Run `npm run dev` or `node scripts/copy-pdf-worker.js`

#### PDF Loading Errors
- **Error**: CORS or 404 errors
- **Solution**: Check PDF URL accessibility
- **Fix**: Use public URLs or configure CORS headers

#### Performance Issues
- **Issue**: Slow loading or rendering
- **Solution**: Optimize PDF file sizes
- **Fix**: Limit thumbnail generation, use lower zoom levels

### Configuration

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

#### PDF.js Worker
The worker file is automatically copied during build:
- Source: `node_modules/pdfjs-dist/build/pdf.worker.mjs`
- Destination: `public/pdf.worker.js`

## Integration Points

### 1. Funeral Creation
- Upload brochure PDF during funeral creation
- Store URL in `funerals.brochure_url`

### 2. Funeral Display
- Show flipbook viewer on funeral event pages
- Use `flipbook` mode for enhanced experience

### 3. Admin Panel
- Preview uploaded brochures
- Manage PDF files

## Best Practices

### Performance
- Generate thumbnails on demand
- Limit concurrent page rendering
- Use appropriate zoom levels

### User Experience
- Provide loading indicators
- Handle errors gracefully
- Support keyboard navigation
- Enable fullscreen mode

### Accessibility
- Add proper ARIA labels
- Support keyboard navigation
- Provide alternative text
- Ensure color contrast

## Future Enhancements

### Planned Features
- Touch gestures for mobile
- Search within PDF content
- Bookmarks and annotations
- Print functionality
- Multiple PDF support

### Technical Improvements
- Server-side PDF processing
- CDN integration for better performance
- Progressive loading for large documents
- Caching strategies
