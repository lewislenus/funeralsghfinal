"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Download, 
  ExternalLink,
  BookOpen,
  Loader2
} from "lucide-react";
import { getPublicPdfUrl } from "@/lib/cloudinary-utils";
import { loadPdf } from "@/lib/pdf-utils";

interface InlinePdfViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
  showPreview?: boolean;
  height?: string;
}

export function InlinePdfViewer({ 
  pdfUrl, 
  title = "Funeral Brochure",
  className = "",
  showPreview = true,
  height = "500px"
}: InlinePdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");

  const publicPdfUrl = getPublicPdfUrl(pdfUrl);

  useEffect(() => {
    loadPdfInfo();
  }, [pdfUrl]);

  const loadPdfInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loadPdf(publicPdfUrl);
      
      if ('error' in result) {
        setError(result.error);
        return;
      }
      
      setNumPages(result.numPages);
      
      // Generate thumbnail of first page
      if (showPreview && result.pdf) {
        try {
          const page = await result.pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.3 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport }).promise;
          setThumbnailUrl(canvas.toDataURL());
        } catch (thumbError) {
          console.warn('Failed to generate thumbnail:', thumbError);
        }
      }
    } catch (error: any) {
      console.error('PDF loading error:', error);
      setError(error.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = publicPdfUrl;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    link.click();
  };

  const handleOpenExternal = () => {
    window.open(publicPdfUrl, '_blank');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Loading PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 mb-2">PDF Not Available</h4>
            <p className="text-slate-600 text-sm mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={loadPdfInfo}>
                Try Again
              </Button>
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              {title}
            </CardTitle>
            {numPages > 0 && (
              <Badge variant="outline" className="mt-2">
                {numPages} pages
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenExternal}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showPreview && thumbnailUrl ? (
          <div className="space-y-4">
            <div className="relative group">
              <img 
                src={thumbnailUrl} 
                alt="PDF Preview" 
                className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleOpenExternal}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <Button onClick={handleOpenExternal} className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Full Document
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h4 className="font-semibold text-slate-800 mb-2">{title}</h4>
            <p className="text-slate-600 text-sm mb-4">
              Click to view the interactive PDF document
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleOpenExternal}>
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
