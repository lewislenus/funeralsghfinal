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
  Download,
  RotateCw,
  Eye,
  Grid3X3,
  BookOpen,
  FileText,
  Share2,
  Search,
  Loader2,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { configurePdfWorker, loadPdf } from "@/lib/pdf-utils";
import { getPublicPdfUrl } from "@/lib/cloudinary-utils";
import { Button } from "@/components/ui/button";
import { shareLink } from "@/lib/share";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface EnhancedPdfViewerProps {
  pdfUrl: string;
  onClose?: () => void;
  title?: string;
  description?: string;
  showInModal?: boolean;
  autoOpen?: boolean;
  fullscreenFit?: 'contain' | 'cover'; // legacy prop kept for compatibility
  suppressPreview?: boolean; // when true, don't render internal PreviewThumbnail wrapper
}

type ViewMode = "single" | "double" | "thumbnail";
type FitMode = 'cover' | 'contain' | 'width' | 'height' | 'actual';

export function EnhancedPdfViewer({ 
  pdfUrl, 
  onClose, 
  title = "Funeral Brochure",
  description = "Interactive PDF Viewer",
  showInModal = true,
  autoOpen = false,
  fullscreenFit = 'contain',
  suppressPreview = false
}: EnhancedPdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdf, setPdf] = useState<any>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Default to single page initially, will be updated by useEffect once isMobile is determined
    return "single";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [fitMode, setFitMode] = useState<FitMode>(fullscreenFit === 'cover' ? 'cover' : 'contain');
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  // Internal trackers kept in refs to avoid triggering full component re-renders that cause visible flicker
  const renderingPagesRef = useRef<Set<number>>(new Set());
  const [resizeTick, setResizeTick] = useState(0); // minimal tick used only for recalculating fit size
  const resizeRafRef = useRef<number | null>(null);
  const openedOnceRef = useRef(false); // prevent re-running entrance animation logic if already open
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const publicPdfUrl = getPublicPdfUrl(pdfUrl);

  // Configure PDF.js worker
  useEffect(() => {
    configurePdfWorker();
  }, []);

  // Update view mode based on screen size
  useEffect(() => {
    if (isMobile !== undefined) {
      // Set default view mode based on screen size
      // Mobile: single page, Desktop: double page
      setViewMode(isMobile ? "single" : "double");
    }
  }, [isMobile]);

  // Load PDF only when first opened (or when pdfUrl changes while open). Prevent duplicate preloads that cause a flash.
  useEffect(() => {
    if (!isOpen || !pdfUrl) return;
    // If already loaded this URL, skip
    if (pdf && openedOnceRef.current) return;
    loadPdfDocument();
    openedOnceRef.current = true;
  }, [pdfUrl, isOpen]);

  // Window resize listener (debounced with rAF + trailing update) to reduce rapid re-renders that may cause blinking
  useEffect(() => {
    const handleResize = () => {
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => {
        setResizeTick(t => t + 1);
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
    };
  }, []);

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
    const maxThumbs = Math.min(numPages, 20); // Limit for performance
    
    for (let i = 1; i <= maxThumbs; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.2 });
        
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
    if (!pdf || !canvas) return;
    if (renderingPagesRef.current.has(pageNum)) return; // skip overlapping render
    renderingPagesRef.current.add(pageNum);
    try {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1, rotation: rotation * Math.PI / 180 });
      let calcScale = scale;
      if (containerRef.current && fitMode !== 'actual') {
        const container = containerRef.current;
        const maxW = container.clientWidth;
        const maxH = container.clientHeight;
        // Guard: if container not yet measured (0 size), delay render slightly instead of clearing canvas
        if (maxW === 0 || maxH === 0) {
          // Re-queue a render on next animation frame
          requestAnimationFrame(() => {
            renderingPagesRef.current.delete(pageNum);
            renderPage(pageNum, canvas, scale);
          });
          return;
        }
        const wScale = maxW / baseViewport.width;
        const hScale = maxH / baseViewport.height;
        switch (fitMode) {
          case 'cover': calcScale = Math.max(wScale, hScale); break;
          case 'contain': calcScale = Math.min(wScale, hScale); break;
          case 'width': calcScale = wScale; break;
          case 'height': calcScale = hScale; break;
        }
      }
      const viewport = page.getViewport({ scale: calcScale, rotation: rotation * Math.PI / 180 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const context = canvas.getContext('2d');
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
      }
    } catch (error) {
      if ((error as any)?.name !== 'RenderingCancelledException') {
        console.error(`Failed to render page ${pageNum}:`, error);
      }
    } finally {
      renderingPagesRef.current.delete(pageNum);
    }
  }, [pdf, zoom, rotation, fitMode, resizeTick]);

  // Render current page(s)
  useEffect(() => {
    if (viewMode === "single") {
      renderPage(currentPage, canvasRef.current);
    } else if (viewMode === "double") {
      renderPage(currentPage, canvasRef.current);
      if (currentPage < numPages) {
        renderPage(currentPage + 1, canvas2Ref.current);
      }
    }
  }, [currentPage, viewMode, renderPage]);

  // Ensure first page renders immediately when PDF loads
  useEffect(() => {
    if (pdf && numPages > 0 && !loading && canvasRef.current) {
      // Small delay to ensure canvas is properly mounted
      const timeoutId = setTimeout(() => {
        // Force render the first page(s) immediately after PDF loads
        if (viewMode === "single" && canvasRef.current) {
          renderPage(1, canvasRef.current);
        } else if (viewMode === "double" && canvasRef.current) {
          renderPage(1, canvasRef.current);
          if (numPages > 1 && canvas2Ref.current) {
            renderPage(2, canvas2Ref.current);
          }
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [pdf, numPages, loading, viewMode, renderPage]);

  // Secondary reinforcement render shortly after open to fix rare blank flashes
  useEffect(() => {
    if (isOpen && pdf && numPages > 0) {
      const id = setTimeout(() => {
        if (viewMode === 'single') {
          renderPage(currentPage, canvasRef.current);
        } else if (viewMode === 'double') {
          renderPage(currentPage, canvasRef.current);
          if (currentPage < numPages) {
            renderPage(currentPage + 1, canvas2Ref.current);
          }
        }
      }, 400); // a bit later than initial 100ms to catch size stabilization
      return () => clearTimeout(id);
    }
  }, [isOpen, pdf, numPages, viewMode, currentPage, renderPage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
    if (e.key === "ArrowLeft") goToPrevPage();
    if (e.key === "ArrowRight") goToNextPage();
    if (e.key === "+") handleZoomIn();
    if (e.key === "-") handleZoomOut();
  };

  const goToPrevPage = () => {
    if (viewMode === "double") {
      setCurrentPage(p => Math.max(1, p - 2));
    } else {
      setCurrentPage(p => Math.max(1, p - 1));
    }
  };

  const goToNextPage = () => {
    if (viewMode === "double") {
      // In double page mode, advance by 2 but don't exceed the total pages
      setCurrentPage(p => {
        const nextPage = p + 2;
        return nextPage > numPages ? numPages : nextPage;
      });
    } else {
      setCurrentPage(p => Math.min(numPages, p + 1));
    }
  };

  const handleZoomIn = () => { setFitMode('actual'); setZoom(z => Math.min(400, z + 25)); };
  const handleZoomOut = () => { setFitMode('actual'); setZoom(z => Math.max(25, z - 25)); };
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
    await shareLink({ url: publicPdfUrl, title, text: description, source: 'pdf_viewer' });
  };

  const PreviewThumbnail = () => (
    <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsOpen(true)}>
      <CardContent className="p-4">
        <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-3 relative overflow-hidden">
          {thumbnails[0] ? (
            <img 
              src={thumbnails[0]} 
              alt="PDF Preview" 
              width={200}
              height={260}
              style={{ width: '100%', height: 'auto' }}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h4 className="font-semibold text-slate-800 mb-1">{title}</h4>
          <p className="text-sm text-slate-600 mb-2">{numPages} pages</p>
          <Button size="sm" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            View Brochure
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FullViewer = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center ${showInModal ? '' : 'relative bg-white'}`}
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
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
                <Badge variant="outline">{numPages} pages</Badge>
              </div>
              
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mr-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single" className="p-2">
                      <FileText className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="double" className="p-2">
                      <BookOpen className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="thumbnail" className="p-2">
                      <Grid3X3 className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>

                {showInModal && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Main PDF Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-white overflow-hidden" ref={containerRef}>
                  {loading && (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-slate-500 animate-spin mb-4" />
                      <p className="text-slate-700 font-medium">Loading PDF...</p>
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
                    <div className="flex gap-0 w-full h-full">
                      {viewMode === "thumbnail" ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl">
                          {thumbnails.map((thumb, index) => (
                            <div
                              key={index}
                              className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                                currentPage === index + 1 ? 'border-blue-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
                              }`}
                              onClick={() => {
                                setCurrentPage(index + 1);
                                setViewMode("single");
                              }}
                            >
                              {thumb ? (
                                <img 
                                  src={thumb} 
                                  alt={`Page ${index + 1}`} 
                                  width={120}
                                  height={160}
                                  style={{ width: '100%', height: 'auto' }}
                                  className="w-full h-auto" 
                                  loading="lazy"
                                />
                              ) : (
                                <div className="aspect-[3/4] bg-slate-200 flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-slate-400" />
                                </div>
                              )}
                              <div className="p-2 text-center text-xs font-medium">
                                Page {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`flex gap-0 w-full h-full items-center justify-center`}>        
                          {viewMode === "double" ? (
                            <div className="flex gap-1 bg-slate-200 p-2 rounded-lg shadow-2xl">
                              <canvas
                                ref={canvasRef}
                                className="shadow-lg rounded-l-lg border-r bg-white max-h-full"
                                style={{ 
                                  transform: `rotate(${rotation}deg)`,
                                  maxWidth: "calc(50vw - 100px)"
                                }}
                              />
                              {currentPage < numPages && (
                                <canvas
                                  ref={canvas2Ref}
                                  className="shadow-lg rounded-r-lg border-l bg-white max-h-full"
                                  style={{ 
                                    transform: `rotate(${rotation}deg)`,
                                    maxWidth: "calc(50vw - 100px)"
                                  }}
                                />
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full relative">
                              <canvas
                                ref={canvasRef}
                                className="w-full h-full block bg-white"
                                style={{
                                  // Canvas pixel size is set in renderPage; CSS ensures it stretches
                                  transform: `rotate(${rotation}deg)`
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                {!loading && !error && (
                  <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 1}>
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
                        <span className="text-sm text-slate-600">of {numPages}</span>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={goToNextPage} 
                        disabled={viewMode === "double" ? currentPage >= numPages : currentPage === numPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-slate-500">
                      {viewMode === "double" && currentPage < numPages 
                        ? `Pages ${currentPage}-${currentPage + 1}` 
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

  // Removed background pre-loading while closed to avoid double-load flicker.

  if (!showInModal) {
    return <FullViewer />;
  }

  // When suppressPreview is true, only render the FullViewer (controlled externally)
  if (suppressPreview) {
    return <FullViewer />;
  }

  return (
    <>
      <PreviewThumbnail />
      <FullViewer />
    </>
  );
}
