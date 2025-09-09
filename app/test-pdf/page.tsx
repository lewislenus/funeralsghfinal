"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EnhancedPdfViewer } from "@/components/enhanced-pdf-viewer";
import { PdfDisplay } from "@/components/pdf-display";
import { configurePdfWorker } from "@/lib/pdf-utils";
import { getPublicPdfUrl } from "@/lib/cloudinary-utils";

// Dynamically import FlipbookViewer to avoid reference errors
const FlipbookViewer = dynamic(() => import("@/components/flipbook-viewer").then(mod => ({ default: mod.FlipbookViewer })), {
  ssr: false,
});

export default function TestPdfPage() {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [showViewer, setShowViewer] = useState<boolean>(false);
  const [viewerMode, setViewerMode] = useState<string>("enhanced");
  const [workerStatus, setWorkerStatus] = useState<string>("Checking...");
  const [pdfJsVersion, setPdfJsVersion] = useState<string>("Loading...");
  
  useEffect(() => {
    // Check PDF.js version
    setPdfJsVersion(pdfjsLib.version);
    
    // Check worker configuration
    const checkWorker = async () => {
      try {
        const success = await configurePdfWorker();
        const workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
        
        if (success && workerSrc) {
          setWorkerStatus(`Configured: ${workerSrc}`);
        } else {
          setWorkerStatus("Not configured");
        }
      } catch (error: any) {
        setWorkerStatus(`Error: ${error?.message || 'Unknown error'}`);
      }
    };
    
    checkWorker();
  }, []);
  
  // Sample PDFs for testing
  const samplePdfs = [
    "https://www.africau.edu/images/default/sample.pdf",
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
  ];
  
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">PDF Viewer Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>PDF URL Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Enter PDF URL:</label>
              <div className="flex gap-2">
                <Input
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  className="flex-1"
                />
                <Button 
                  onClick={() => setShowViewer(true)} 
                  disabled={!pdfUrl}
                >
                  View PDF
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Viewer Mode:</label>
              <div className="flex gap-2">
                <Button
                  variant={viewerMode === "enhanced" ? "default" : "outline"}
                  onClick={() => setViewerMode("enhanced")}
                  size="sm"
                >
                  Enhanced Viewer
                </Button>
                <Button
                  variant={viewerMode === "legacy" ? "default" : "outline"}
                  onClick={() => setViewerMode("legacy")}
                  size="sm"
                >
                  Legacy Flipbook
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Or select a sample PDF:</p>
              <div className="flex flex-wrap gap-2">
                {samplePdfs.map((url, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      setPdfUrl(url);
                      setShowViewer(true);
                    }}
                  >
                    Sample PDF {index + 1}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* PDF Display Component Previews */}
            {pdfUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">PDF Display Component Previews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preview Mode</h4>
                    <PdfDisplay 
                      pdfUrl={pdfUrl}
                      title="Test PDF"
                      mode="preview"
                      className="h-48"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Modal Mode</h4>
                    <PdfDisplay 
                      pdfUrl={pdfUrl}
                      title="Test PDF"
                      mode="modal"
                      className="h-48"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Inline Mode</h4>
                    <PdfDisplay 
                      pdfUrl={pdfUrl}
                      title="Test PDF"
                      mode="inline"
                      height="200px"
                      className="h-48"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Embed Mode</h4>
                    <PdfDisplay 
                      pdfUrl={pdfUrl}
                      title="Test PDF"
                      mode="embed"
                      height="200px"
                      className="h-48"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Technical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>
              <strong>PDF.js Version:</strong>{" "}
              <span className="font-mono">
                {pdfJsVersion}
              </span>
            </p>
            <p>
              <strong>Worker Configuration:</strong>{" "}
              <span className={`font-mono ${workerStatus.includes('Error') ? 'text-red-500' : workerStatus.includes('Configured') ? 'text-green-500' : 'text-yellow-500'}`}>
                {workerStatus}
              </span>
            </p>
            <p className="text-sm text-slate-600 mt-4">
              If you're seeing errors about GlobalWorkerOptions.workerSrc, it means the
              PDF.js worker script couldn't be loaded. This can happen due to CORS issues
              or network problems.
            </p>
            
            {/* Cloudinary URL Fixer */}
            {pdfUrl && pdfUrl.includes('cloudinary.com') && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">Cloudinary URL Tools</h4>
                <p className="text-sm text-slate-600 mb-3">
                  If you're having issues with a Cloudinary PDF, try these options:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const fixedUrl = pdfUrl.replace('/raw/upload/', '/image/upload/fl_attachment/');
                      setPdfUrl(fixedUrl);
                    }}
                  >
                    Fix Raw URL
                  </Button>
                  <a 
                    href={getPublicPdfUrl(pdfUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Direct Download
                  </a>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Current URL: <span className="font-mono break-all">{pdfUrl}</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showViewer && viewerMode === "enhanced" && (
        <EnhancedPdfViewer
          pdfUrl={getPublicPdfUrl(pdfUrl)}
          title="Test PDF Document"
          description="PDF Viewer Test Page"
          showInModal={true}
          autoOpen={true}
          onClose={() => setShowViewer(false)}
        />
      )}
      
      {showViewer && viewerMode === "legacy" && (
        <FlipbookViewer
          pdfUrl={getPublicPdfUrl(pdfUrl)}
          onClose={() => setShowViewer(false)}
        />
      )}
    </div>
  );
}
