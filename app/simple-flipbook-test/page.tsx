"use client";

import { PdfDisplay } from "@/components/pdf-display";

export default function SimpleFlipbookTest() {
  // Test with a known working PDF
  const testPdfUrl = "https://raw.githubusercontent.com/mozilla/pdf.js/main/examples/learning/helloworld.pdf";

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Flipbook Test - Simple Version</h1>
      
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Testing Flipbook Mode</h2>
          <p className="text-gray-600 mb-4">
            This should display a PDF in flipbook mode with page-turning animations.
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <PdfDisplay 
            pdfUrl={testPdfUrl}
            title="Test Flipbook"
            description="Testing flipbook functionality"
            mode="flipbook"
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>If the flipbook displays correctly with page-turning animations, the functionality is working!</p>
        </div>
      </div>
    </div>
  );
}
