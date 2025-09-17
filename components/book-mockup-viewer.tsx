"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { loadPdf, configurePdfWorker } from '@/lib/pdf-utils';
import { getPublicPdfUrl } from '@/lib/cloudinary-utils';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Download, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookMockupViewerProps {
  pdfUrl: string;
  title?: string;
  onClose?: () => void;
  autoOpen?: boolean;
}

/**
 * BookMockupViewer renders the PDF with a simple 3D book spread illusion.
 * It pre-renders current & next page canvases and uses perspective + shadow.
 */
export function BookMockupViewer({ pdfUrl, title = 'Brochure', onClose, autoOpen = true }: BookMockupViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const publicUrl = getPublicPdfUrl(pdfUrl);

  useEffect(() => { configurePdfWorker(); }, []);

  useEffect(() => { if (autoOpen && pdfUrl) init(); }, [pdfUrl, autoOpen]);

  const init = async () => {
    try {
      setLoading(true);
      const result = await loadPdf(publicUrl);
      if ('error' in result) throw new Error(result.error);
      setPdf(result.pdf);
      setNumPages(result.numPages);
    } catch (e) {
      console.error('Book mockup load error', e);
    } finally { setLoading(false); }
  };

  const renderPage = useCallback(async (p: number, canvas: HTMLCanvasElement | null) => {
    if (!pdf || !canvas || p < 1 || p > numPages) return;
    try {
      const pageObj = await pdf.getPage(p);
      const container = containerRef.current;
      const baseViewport = pageObj.getViewport({ scale: 1, rotation });
      let scale = 1;
      if (container) {
        const halfWidth = (container.clientWidth - 40) / 2; // gap & padding
        const maxHeight = container.clientHeight - 60; // header space
        const wScale = halfWidth / baseViewport.width;
        const hScale = maxHeight / baseViewport.height;
        scale = Math.min(wScale, hScale);
      }
      const viewport = pageObj.getViewport({ scale, rotation });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) await pageObj.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.warn('Render page failed', e);
    }
  }, [pdf, numPages, rotation]);

  // Render current spread
  useEffect(() => {
    renderPage(page, leftCanvasRef.current);
    renderPage(page + 1, rightCanvasRef.current);
  }, [page, renderPage]);

  const next = () => setPage(p => Math.min(p + 2, (numPages % 2 === 0 ? numPages - 1 : numPages)));
  const prev = () => setPage(p => Math.max(1, p - 2));

  const download = () => {
    const a = document.createElement('a');
    a.href = publicUrl;
    a.download = title.replace(/\s+/g,'_') + '.pdf';
    a.click();
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isFullscreen ? 'bg-black' : 'bg-black/90'} text-white`}>      
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
        <h2 className="font-semibold tracking-wide">{title} <span className="text-xs font-normal ml-2 opacity-70">Book View</span></h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={()=> setRotation(r=> (r+90)%360)} title="Rotate"><RotateCw className="w-4 h-4"/></Button>
          <Button variant="outline" size="sm" onClick={download} title="Download"><Download className="w-4 h-4"/></Button>
          <Button variant="outline" size="sm" onClick={()=> setIsFullscreen(f=> !f)} title="Fullscreen">{isFullscreen? <Minimize2 className="w-4 h-4"/>: <Maximize2 className="w-4 h-4"/>}</Button>
          {onClose && <Button variant="destructive" size="sm" onClick={onClose}>Close</Button>}
        </div>
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center justify-center px-10 select-none">
        {loading && <div className="text-slate-300">Loading...</div>}
        {!loading && (
          <div className="relative flex gap-0 perspective-[2200px]">
            {/* Book spine shadow */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[3px] bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-10 pointer-events-none" />
            {/* Left Page */}
            <div className="book-leaf-left group">
              <canvas ref={leftCanvasRef} className="page-canvas" />
              <div className="page-glow-left" />
            </div>
            {/* Right Page */}
            <div className="book-leaf-right group">
              <canvas ref={rightCanvasRef} className="page-canvas" />
              <div className="page-glow-right" />
            </div>
          </div>
        )}
        {/* Navigation */}
        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-6">
          <Button variant="outline" size="icon" disabled={page===1} onClick={prev}><ChevronLeft className="w-4 h-4"/></Button>
          <span className="text-sm tracking-wide font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur">{page}-{Math.min(page+1,numPages)} / {numPages}</span>
          <Button variant="outline" size="icon" disabled={page>=numPages-1} onClick={next}><ChevronRight className="w-4 h-4"/></Button>
        </div>
      </div>
      <style jsx>{`
        .perspective-[2200px]{ perspective:2200px; }
        .book-leaf-left,.book-leaf-right{ position:relative; background:#fff; box-shadow:0 8px 24px -4px rgba(0,0,0,.35),0 2px 6px rgba(0,0,0,.25); border-radius:6px; overflow:hidden; }
        .book-leaf-left{ transform-origin:right center; margin-right:0; }
        .book-leaf-right{ transform-origin:left center; margin-left:0; }
        .page-canvas{ display:block; height:100%; width:100%; }
        .book-leaf-left:before,.book-leaf-right:before{ content:''; position:absolute; inset:0; background:repeating-linear-gradient(90deg,rgba(0,0,0,0)0,rgba(0,0,0,.015)1px,rgba(0,0,0,0)2px); pointer-events:none; mix-blend-mode:multiply; }
        .page-glow-left,.page-glow-right{ position:absolute; top:0; bottom:0; width:50%; pointer-events:none; }
        .page-glow-left{ left:0; background:linear-gradient(to left,rgba(0,0,0,.18),rgba(0,0,0,0)); }
        .page-glow-right{ right:0; background:linear-gradient(to right,rgba(0,0,0,.18),rgba(0,0,0,0)); }
        .book-leaf-left:hover{ transform:rotateY(-2deg); }
        .book-leaf-right:hover{ transform:rotateY(2deg); }
        @media (max-width:900px){
          .book-leaf-left,.book-leaf-right{ width:45vw; }
        }
        @media (min-width:901px){
          .book-leaf-left,.book-leaf-right{ width:38vw; }
        }
      `}</style>
    </div>
  );
}

export default BookMockupViewer;