"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Download,
  Share2,
  BookOpen,
  FileText,
  Grid3X3,
  Loader2,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { configurePdfWorker, loadPdf } from "@/lib/pdf-utils";
import { getPublicPdfUrl } from "@/lib/cloudinary-utils";
import { Button } from "@/components/ui/button";
import { shareLink } from "@/lib/share";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImprovedFlipbookViewerProps {
  pdfUrl: string;
  onClose?: () => void;
  title?: string;
  description?: string;
  showInModal?: boolean;
  autoOpen?: boolean;
}

type ViewMode = "single" | "flipbook" | "thumbnail";

export function ImprovedFlipbookViewer({ 
  pdfUrl, 
  onClose, 
  title = "Funeral Brochure",
  description = "Interactive Flipbook Viewer",
  showInModal = true,
  autoOpen = false
}: ImprovedFlipbookViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdf, setPdf] = useState<any>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("flipbook");
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [renderingPages, setRenderingPages] = useState<Set<number>>(new Set());
  const [isFlipping, setIsFlipping] = useState(false);
  
  const leftPageRef = useRef<HTMLCanvasElement>(null);
  const rightPageRef = useRef<HTMLCanvasElement>(null);
  const singlePageRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const publicPdfUrl = getPublicPdfUrl(pdfUrl);

  // Configure PDF.js worker
  useEffect(() => {
    configurePdfWorker();
  }, []);

  // Load PDF when URL changes or component opens
  useEffect(() => {
    if (isOpen && pdfUrl) {
      loadPdfDocument();
    }
  }, [pdfUrl, isOpen]);

  // Generate thumbnails when PDF loads
  useEffect(() => {
    if (pdf && numPages > 0) {
      generateThumbnails();
    }
  }, [pdf, numPages]);

  const loadPdfDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loadPdf(publicPdfUrl);
      
      if ('error' in result) {
        setError(result.error);
        return;
      }
      
      setPdf(result.pdf);
      setNumPages(result.numPages);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('PDF loading error:', error);
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async () => {
    if (!pdf) return;
    
    const thumbs: string[] = [];
    const maxThumbs = Math.min(numPages, 20);
    
    for (let i = 1; i <= maxThumbs; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.15 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        thumbs.push(canvas.toDataURL());
      } catch (err) {
        console.warn(`Failed to generate thumbnail for page ${i}`, err);
        thumbs.push('');
      }
    }
    
    setThumbnails(thumbs);
  };

  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement | null, scale: number = zoom / 100) => {
    if (!pdf || !canvas || renderingPages.has(pageNum) || pageNum > numPages) return;
    
    setRenderingPages(prev => new Set(prev).add(pageNum));
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation: rotation });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const context = canvas.getContext('2d');
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (error) {
      console.error(`Failed to render page ${pageNum}:`, error);
    } finally {
      setRenderingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageNum);
        return newSet;
      });
    }
  }, [pdf, zoom, rotation, renderingPages, numPages]);

  // Render current page(s) based on view mode
  useEffect(() => {
    if (viewMode === "single") {
      renderPage(currentPage, singlePageRef.current);
    } else if (viewMode === "flipbook") {
      // In flipbook mode, left page is always odd, right page is even
      const leftPageNum = currentPage % 2 === 0 ? currentPage - 1 : currentPage;
      const rightPageNum = leftPageNum + 1;
      
      renderPage(leftPageNum, leftPageRef.current);
      if (rightPageNum <= numPages) {
        renderPage(rightPageNum, rightPageRef.current);
      }
    }
  }, [currentPage, viewMode, renderPage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
    if (e.key === "ArrowLeft") goToPrevPage();
    if (e.key === "ArrowRight") goToNextPage();
    if (e.key === "+") handleZoomIn();
    if (e.key === "-") handleZoomOut();
  };

  const goToPrevPage = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 300);
    
    if (viewMode === "flipbook") {
      setCurrentPage(p => {
        if (p <= 1) return 1;
        return p % 2 === 0 ? p - 1 : Math.max(1, p - 2);
      });
    } else {
      setCurrentPage(p => Math.max(1, p - 1));
    }
  };

  const goToNextPage = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 300);
    
    if (viewMode === "flipbook") {
      setCurrentPage(p => {
        if (p >= numPages) return numPages;
        return p % 2 === 0 ? Math.min(numPages, p + 1) : Math.min(numPages, p + 2);
      });
    } else {
      setCurrentPage(p => Math.min(numPages, p + 1));
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(300, z + 25));
  const handleZoomOut = () => setZoom(z => Math.max(50, z - 25));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = publicPdfUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    link.click();
  };

  const handleShare = async () => {
    await shareLink({ url: publicPdfUrl, title, text: description, source: 'flipbook_viewer' });
  };

  const FullViewer = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 z-50 flex items-center justify-center ${showInModal ? '' : 'relative bg-white'}`}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white w-full h-full flex flex-col shadow-2xl ${
              showInModal 
                ? `rounded-2xl max-w-7xl max-h-[95vh] ${isFullscreen ? "max-w-full max-h-full rounded-none" : ""}` 
                : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-amber-800">{title}</h3>
                  <p className="text-sm text-amber-600">{description}</p>
                </div>
                <Badge variant="outline" className="border-amber-300 text-amber-700">{numPages} pages</Badge>
              </div>
              
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mr-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single" className="p-2" title="Single Page">
                      <FileText className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="flipbook" className="p-2" title="Flipbook View">
                      <BookOpen className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="thumbnail" className="p-2" title="Thumbnail Grid">
                      <Grid3X3 className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 300}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>

                {showInModal && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 overflow-auto" ref={containerRef}>
                  {loading && (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
                      <p className="text-amber-700 font-medium">Loading your brochure...</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
                      <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading PDF</h3>
                      <p className="text-red-600 mb-4">{error}</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={loadPdfDocument} variant="outline">
                          Try Again
                        </Button>
                        <Button onClick={handleDownload}>
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!loading && !error && (
                    <div className="flex gap-4">
                      {viewMode === "thumbnail" ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl">
                          {thumbnails.map((thumb, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                                currentPage === index + 1 ? 'border-amber-500 shadow-lg' : 'border-slate-200 hover:border-amber-300'
                              }`}
                              onClick={() => {
                                setCurrentPage(index + 1);
                                setViewMode("single");
                              }}
                            >
                              {thumb ? (
                                <img src={thumb} alt={`Page ${index + 1}`} className="w-full h-auto" />
                              ) : (
                                <div className="aspect-[3/4] bg-slate-200 flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                              )}
                              <div className="p-2 text-center text-xs font-medium bg-amber-50">
                                Page {index + 1}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : viewMode === "flipbook" ? (
                        <motion.div 
                          className="relative"
                          initial={false}
                          animate={{ 
                            rotateY: isFlipping ? 5 : 0,
                            scale: isFlipping ? 0.98 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Book spine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-lg transform perspective-1000 rotateY-90 w-4 left-1/2 -translate-x-2 shadow-2xl"></div>
                          
                          {/* Book pages */}
                          <div className="flex bg-amber-100 p-2 rounded-lg shadow-2xl border-4 border-amber-800 relative perspective-1000">
                            {/* Left page */}
                            <motion.div
                              className="relative"
                              animate={{ rotateY: isFlipping ? -15 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <canvas
                                ref={leftPageRef}
                                className="shadow-lg rounded-l-lg border-r-2 border-amber-200 bg-white"
                                style={{ 
                                  transform: `rotate(${rotation}deg)`,
                                  maxWidth: "calc(45vw - 50px)",
                                  maxHeight: "70vh"
                                }}
                              />
                            </motion.div>
                            
                            {/* Right page */}
                            {currentPage < numPages && (
                              <motion.div
                                className="relative"
                                animate={{ rotateY: isFlipping ? 15 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <canvas
                                  ref={rightPageRef}
                                  className="shadow-lg rounded-r-lg border-l-2 border-amber-200 bg-white"
                                  style={{ 
                                    transform: `rotate(${rotation}deg)`,
                                    maxWidth: "calc(45vw - 50px)",
                                    maxHeight: "70vh"
                                  }}
                                />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={false}
                          animate={{ scale: isFlipping ? 0.95 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <canvas
                            ref={singlePageRef}
                            className="shadow-2xl rounded-lg border-4 border-amber-200 bg-white"
                            style={{ 
                              transform: `rotate(${rotation}deg)`,
                              maxWidth: "90vw",
                              maxHeight: "70vh"
                            }}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                {!loading && !error && (
                  <div className="flex items-center justify-between p-4 border-t border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-b-2xl">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToPrevPage} 
                        disabled={currentPage === 1 || isFlipping}
                        className="hover:bg-amber-100"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={numPages}
                          value={currentPage}
                          onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= numPages) {
                              setCurrentPage(page);
                            }
                          }}
                          className="w-16 text-center"
                        />
                        <span className="text-sm text-amber-700">of {numPages}</span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToNextPage} 
                        disabled={currentPage >= numPages || isFlipping}
                        className="hover:bg-amber-100"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-amber-600 font-medium">
                      {viewMode === "flipbook" && currentPage < numPages 
                        ? `Pages ${currentPage % 2 === 0 ? currentPage - 1 : currentPage}-${(currentPage % 2 === 0 ? currentPage - 1 : currentPage) + 1}` 
                        : `Page ${currentPage}`
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Load PDF metadata for preview
  useEffect(() => {
    if (pdfUrl && !isOpen) {
      loadPdfDocument();
    }
  }, [pdfUrl]);

  if (!showInModal) {
    return <FullViewer />;
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Open Flipbook Viewer
      </Button>
      <FullViewer />
    </>
  );
}
