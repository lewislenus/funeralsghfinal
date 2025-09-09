// This file serves as a simple proxy to load the PDF.js worker
// It helps with potential CORS issues
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get version from query params or use default
    const version = '3.11.174'; // Match your pdfjs-dist version
    
    // Fetch the worker from CDN
    const response = await fetch(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF worker: ${response.status}`);
    }
    
    const workerJs = await response.text();
    
    // Return the worker script with appropriate headers
    return new NextResponse(workerJs, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400', // Cache for a day
      },
    });
  } catch (error) {
    console.error('Error loading PDF worker:', error);
    return NextResponse.json(
      { error: 'Failed to load PDF worker' },
      { status: 500 }
    );
  }
}
