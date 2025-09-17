"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Download, BookOpen } from "lucide-react";
import { getPublicPdfUrl } from "@/lib/cloudinary-utils";
import { configurePdfWorker, loadPdf } from "@/lib/pdf-utils";

interface PageFlipViewerProps {
  pdfUrl: string;
  title?: string;
  onClose?: () => void;
  showInModal?: boolean;
  autoOpen?: boolean;
}

export default function PageFlipViewer({ pdfUrl, title = "Funeral Brochure", onClose, showInModal = true, autoOpen = false }: PageFlipViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pdf, setPdf] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverSrc, setCoverSrc] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const flipRef = useRef<any>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [firstPageAspect, setFirstPageAspect] = useState(0.75); // width / height, default 3:4
  const [bookSize, setBookSize] = useState<{ width: number; height: number }>({ width: 480, height: 640 });

  const publicUrl = useMemo(() => getPublicPdfUrl(pdfUrl), [pdfUrl]);

  useEffect(() => { configurePdfWorker(); }, []);

  // Preload PDF and generate a small cover image (first page)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!publicUrl) return;
      // If we already have a PDF and a cover, skip
      if (pdf && coverSrc) return;
      setCoverLoading(true);
      setCoverError(null);
      const result = await loadPdf(publicUrl);
      if (cancelled) return;
      if ('error' in result) {
        setCoverError(result.error);
        setCoverLoading(false);
        return;
      }
      setPdf(result.pdf);
      setNumPages(result.numPages);
      try {
        const page = await result.pdf.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        if (baseViewport.width && baseViewport.height) {
          setFirstPageAspect(baseViewport.width / baseViewport.height);
        }
        const desiredWidth = 320; // thumbnail width
        const scale = Math.min(2, Math.max(0.5, desiredWidth / baseViewport.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx as any, viewport }).promise;
        setCoverSrc(canvas.toDataURL('image/png'));
      } catch (e: any) {
        setCoverError(e?.message || 'Failed to render cover');
      }
      setCoverLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [publicUrl, pdf, coverSrc]);

  // When opening the flipbook, ensure any missing state is filled (in case only cover was loaded)
  useEffect(() => {
    let cancelled = false;
    if (!isOpen || !publicUrl || pdf) return;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await loadPdf(publicUrl);
      if (cancelled) return;
      if ('error' in result) {
        setError(result.error);
      } else {
        setPdf(result.pdf);
        setNumPages(result.numPages);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [publicUrl, isOpen, pdf]);

  // Compute responsive book size to maximize within available container space and keep it centered
  useEffect(() => {
    if (!isOpen) return; // Only compute when modal is open
    const compute = () => {
      const el = contentRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Minimal margin for navigation buttons
      const margin = 120; // space for left/right buttons
      const availableW = Math.max(400, rect.width - margin);
      const availableH = Math.max(400, rect.height - 20);

      // In two-page view, total width ≈ 2 * pageWidth
      const ratio = firstPageAspect || 0.75; // pageWidth / pageHeight
      const pageWidthFromHeight = availableH * ratio; // if constrained by height
      const pageWidthFromWidth = availableW / 2; // if constrained by two-page layout width
      const pageWidth = Math.max(300, Math.min(pageWidthFromHeight, pageWidthFromWidth, 1200));
      const pageHeight = pageWidth / ratio;

      const newSize = { width: Math.round(pageWidth), height: Math.round(pageHeight) };
      // Only update if size actually changed to prevent unnecessary re-renders
      setBookSize(prev => {
        if (prev.width === newSize.width && prev.height === newSize.height) {
          return prev;
        }
        return newSize;
      });
    };
    
    compute();
    const ro = new ResizeObserver(compute);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [firstPageAspect, isOpen]);

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = publicUrl;
    link.rel = 'noopener noreferrer';
    link.target = '_blank';
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const Page = ({ pageNumber }: { pageNumber: number }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);
    const mountedRef = useRef(false);

    const doRender = useCallback(async () => {
      if (!pdf || !canvasRef.current) return;
      // Prevent overlapping renders
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
        renderTaskRef.current = null;
      }
      try {
        const p = await pdf.getPage(pageNumber);
        const base = p.getViewport({ scale: 1 });
        const scale = Math.max(0.5, Math.min(4, bookSize.width / base.width));
        const viewport = p.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const task = p.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('PDF render error:', err);
        }
      }
    }, [pdf, pageNumber, bookSize.width]);

    useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; if (renderTaskRef.current) { try { renderTaskRef.current.cancel(); } catch {} } }; }, []);
    useEffect(() => { doRender(); }, [doRender]);

    return <div className="bg-white" style={{ width: bookSize.width, height: bookSize.height }}><canvas ref={canvasRef} className="w-full h-full" /></div>;
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    showInModal ? (
      <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'bg-black/80'} flex items-center justify-center`}>
        <div className={`bg-white ${isFullscreen ? 'w-screen h-screen' : 'w-full max-w-6xl h-[85vh]'} rounded-xl shadow-2xl overflow-hidden relative`}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-white/90 backdrop-blur p-3 border-b">
            <div className="font-semibold">{title}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(f => !f)}>{isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</Button>
              <Button variant="outline" size="sm" onClick={handleDownload}><Download className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => { setIsOpen(false); onClose?.(); }}><X className="w-4 h-4" /></Button>
            </div>
          </div>
          <div ref={contentRef} className="w-full h-full flex items-center justify-center pt-12 bg-slate-100">
            {children}
          </div>
        </div>
      </div>
    ) : (
      <div className="w-full">{children}</div>
    )
  );

  if (!isOpen) {
    return (
      <div className="w-full space-y-3">
        {coverSrc ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative w-full overflow-hidden rounded-lg border bg-white shadow hover:shadow-md transition-shadow"
            aria-label="Open Funeral Brochure"
          >
            <img src={coverSrc} alt={`${title} cover`} className="w-full h-auto block" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="inline-flex items-center px-3 py-2 text-white bg-black/60 rounded-md text-sm">
                <BookOpen className="w-4 h-4 mr-2" /> Open Funeral Brochure
              </span>
            </div>
          </button>
        ) : coverLoading ? (
          <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">Loading cover…</div>
        ) : coverError ? (
          <div className="w-full h-64 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-600">
            <span>Unable to load cover</span>
            <Button onClick={() => setIsOpen(true)} className="mt-2">Open Funeral Brochure</Button>
          </div>
        ) : null}
        <Button onClick={() => setIsOpen(true)} className="w-full">Open Funeral Brochure</Button>
      </div>
    );
  }

  if (loading) {
    return <Wrapper><div className="text-slate-600">Loading...</div></Wrapper>;
  }

  if (error) {
    return <Wrapper><div className="text-red-600">{error}</div></Wrapper>;
  }

  return (
    <Wrapper>
      <div className="relative">
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-10">
          <Button variant="outline" size="icon" onClick={() => flipRef.current?.pageFlip().flipPrev()}><ChevronLeft className="w-4 h-4" /></Button>
        </div>
        <HTMLFlipBook
          width={bookSize.width}
          height={bookSize.height}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1536}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="shadow-2xl rounded-lg"
          ref={flipRef}
        >
          {pages.map((p) => (
            <div key={p} className="bg-white">
              <Page pageNumber={p} />
            </div>
          ))}
        </HTMLFlipBook>
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-10">
          <Button variant="outline" size="icon" onClick={() => flipRef.current?.pageFlip().flipNext()}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </Wrapper>
  );
}
