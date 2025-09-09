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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EnhancedPdfViewerProps {
  pdfUrl: string;
  onClose?: () => void;
  title?: string;
  description?: string;
  showInModal?: boolean;
  autoOpen?: boolean;
}

type ViewMode = "single" | "double" | "thumbnail";

export function EnhancedPdfViewer({ 
  pdfUrl, 
  onClose, 
  title = "Funeral Brochure",
  description = "Interactive PDF Viewer",
  showInModal = true,
  autoOpen = false
}: EnhancedPdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdf, setPdf] = useState<any>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [renderingPages, setRenderingPages] = useState<Set<number>>(new Set());
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
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
    if (!pdf || !canvas || renderingPages.has(pageNum)) return;
    
    setRenderingPages(prev => new Set(prev).add(pageNum));
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation: rotation * Math.PI / 180 });
      
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
  }, [pdf, zoom, rotation, renderingPages]);

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: publicPdfUrl,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard?.writeText(publicPdfUrl);
      }
    } else {
      navigator.clipboard?.writeText(publicPdfUrl);
    }
  };

  const PreviewThumbnail = () => (
    <Card className="w-full max-w-sm cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsOpen(true)}>
      <CardContent className="p-4">
        <div className="aspect-[3/4] bg-slate-100 rounded-lg mb-3 relative overflow-hidden">
          {thumbnails[0] ? (
            <img 
              src={thumbnails[0]} 
              alt="PDF Preview" 
              className="w-full h-full object-contain"
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
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="mr-4">
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
              {/* Main PDF Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center p-4 bg-slate-100 overflow-auto" ref={containerRef}>
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
                    <div className="flex gap-4">
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
                                <img src={thumb} alt={`Page ${index + 1}`} className="w-full h-auto" />
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
                        <div className={`flex gap-2 ${viewMode === "double" ? "justify-center" : "justify-center"}`}>
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
                            <canvas
                              ref={canvasRef}
                              className="shadow-lg rounded-lg border bg-white max-w-full max-h-full"
                              style={{ 
                                transform: `rotate(${rotation}deg)`,
                                maxWidth: "90vw",
                                maxHeight: "70vh"
                              }}
                            />
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
      <PreviewThumbnail />
      <FullViewer />
    </>
  );
}
