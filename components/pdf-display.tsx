"use client";

import { useState } from "react";
import { EnhancedPdfViewer } from "./enhanced-pdf-viewer";
import { InlinePdfViewer } from "./inline-pdf-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Download, 
  BookOpen,
  ExternalLink,
  Maximize2
} from "lucide-react";

interface PdfDisplayProps {
  pdfUrl: string;
  title?: string;
  description?: string;
  mode?: "preview" | "inline" | "modal" | "embed" | "flipbook";
  className?: string;
  height?: string;
  showThumbnail?: boolean;
}

export function PdfDisplay({ 
  pdfUrl, 
  title = "PDF Document",
  description = "Interactive PDF viewer",
  mode = "preview",
  className = "",
  height = "400px",
  showThumbnail = true
}: PdfDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  if (!pdfUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No PDF available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Flipbook mode - uses the enhanced PDF viewer with flipbook styling
  if (mode === "flipbook") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-4">{description}</p>
          <EnhancedPdfViewer
            pdfUrl={pdfUrl}
            title={title}
            description={description}
            showInModal={true}
            autoOpen={false}
          />
        </CardContent>
      </Card>
    );
  }

  // Preview mode - shows thumbnail with modal trigger
  if (mode === "preview") {
    return (
      <>
        <InlinePdfViewer 
          pdfUrl={pdfUrl}
          title={title}
          className={className}
          showPreview={showThumbnail}
          height={height}
        />
        <div className="mt-3">
          <Button 
            onClick={() => setShowModal(true)}
            className="w-full"
            variant="outline"
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            Open Full Viewer
          </Button>
        </div>
        
        {showModal && (
          <EnhancedPdfViewer
            pdfUrl={pdfUrl}
            title={title}
            description={description}
            showInModal={true}
            autoOpen={true}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Inline mode - shows PDF viewer directly embedded
  if (mode === "inline") {
    return (
      <InlinePdfViewer 
        pdfUrl={pdfUrl}
        title={title}
        className={className}
        showPreview={showThumbnail}
        height={height}
      />
    );
  }

  // Modal mode - button that opens full modal
  if (mode === "modal") {
    return (
      <>
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{description}</p>
            <Button onClick={() => setShowModal(true)} className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View PDF
            </Button>
          </CardContent>
        </Card>
        
        {showModal && (
          <EnhancedPdfViewer
            pdfUrl={pdfUrl}
            title={title}
            description={description}
            showInModal={true}
            autoOpen={true}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // Embed mode - iframe fallback for simple viewing
  if (mode === "embed") {
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title.replace(/\s+/g, '_')}.pdf`;
      link.click();
    };

    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              {title}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative" style={{ height }}>
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0 rounded-lg"
              title={title}
            />
          </div>
        </CardContent>
        
        {showModal && (
          <EnhancedPdfViewer
            pdfUrl={pdfUrl}
            title={title}
            description={description}
            showInModal={true}
            autoOpen={true}
            onClose={() => setShowModal(false)}
          />
        )}
      </Card>
    );
  }

  return null;
}
