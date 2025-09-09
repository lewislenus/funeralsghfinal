"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import { configurePdfWorker, loadPdf } from "@/lib/pdf-utils";
import { isCloudinaryRawUrl, getDownloadUrl } from "@/lib/cloudinary-utils";

interface FlipbookViewerProps {
  pdfUrl: string;
  onClose: () => void;
}

export function FlipbookViewer({ pdfUrl, onClose }: FlipbookViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdf, setPdf] = useState<any>(null);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Configure the PDF.js worker when component mounts
    configurePdfWorker();
  }, []);

  useEffect(() => {
    const initPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if URL is from Cloudinary and if there's a fallback URL
        let urlToLoad = pdfUrl;
        if (isCloudinaryRawUrl(pdfUrl)) {
          const downloadUrl = getDownloadUrl(pdfUrl);
          if (downloadUrl !== pdfUrl) {
            console.log('Using download URL for Cloudinary PDF');
            urlToLoad = downloadUrl;
          }
        }
        
        const result = await loadPdf(urlToLoad);
        
        if ('error' in result) {
          setError(result.error);
          setLoading(false);
          return;
        }
        
        setPdf(result.pdf);
        setNumPages(result.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (error: any) {
        console.error('PDF initialization error:', error);
        setError(error.message || 'An unexpected error occurred');
        setLoading(false);
      }
    };
    
    if (pdfUrl) {
      initPdf();
    }
  }, [pdfUrl]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoom / 100 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    };
    renderPage();
  }, [pdf, currentPage, zoom]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") setCurrentPage((p) => Math.max(1, p - 1));
    if (e.key === "ArrowRight")
      setCurrentPage((p) => Math.min(numPages, p + 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        onKeyDown={handleKeyPress}
        tabIndex={0}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col shadow-2xl ${
            isFullscreen ? "max-w-full max-h-full rounded-none" : ""
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Funeral Brochure
              </h3>
              <p className="text-sm text-slate-600">Interactive PDF Viewer</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen((f) => !f)}
                className="p-2 rounded hover:bg-slate-200"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-red-100"
                title="Close"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>
            </div>
          </div>

          {/* PDF Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-100 to-slate-200 overflow-auto">
            {loading && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-700 font-medium">Loading PDF...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading PDF</h3>
                <p className="text-red-600">{error}</p>
                {isCloudinaryRawUrl(pdfUrl) && (
                  <p className="text-sm text-slate-600 mt-2">
                    This PDF is stored on Cloudinary and may require authentication. 
                    Try downloading it first and then viewing it locally.
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                  {isCloudinaryRawUrl(pdfUrl) && (
                    <a
                      href={getDownloadUrl(pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {!loading && !error && (
              <canvas
                ref={canvasRef}
                className="shadow-2xl rounded-lg border bg-white"
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-slate-200 disabled:opacity-50"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-slate-700 font-medium">
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage === numPages}
                className="p-2 rounded hover:bg-slate-200 disabled:opacity-50"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(25, z - 10))}
                className="p-2 rounded hover:bg-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-slate-700 font-medium">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(400, z + 10))}
                className="p-2 rounded hover:bg-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
