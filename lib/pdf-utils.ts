/**
 * PDF.js Worker Configuration Utility
 * 
 * This file provides helper functions to configure the PDF.js worker
 * with multiple fallback options to ensure PDF rendering works in all environments.
 */

import * as pdfjsLib from 'pdfjs-dist';
import { isCloudinaryRawUrl, getDownloadUrl } from './cloudinary-utils';

/**
 * Configure the PDF.js worker with multiple fallback options
 * @returns {Promise<boolean>} True if worker was successfully configured
 */
export async function configurePdfWorker(): Promise<boolean> {
  try {
    // Create a blob URL for the worker
    const workerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
    
    // If already configured, don't do anything
    if (workerSrc && typeof workerSrc === 'string' && workerSrc.length > 0) {
      return true;
    }
    
    // Use a direct import instead of CDN for more reliability
    // For Next.js, this is the most reliable approach as it bundles the worker
  // Prefer local worker shipped in public/ for Next.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    
    return true;
  } catch (err) {
    console.error('Failed to configure PDF.js worker:', err);
    return false;
  }
}

/**
 * Safe function to load a PDF with error handling
 * @param {string} url The URL of the PDF to load
 * @returns {Promise<{pdf: any, numPages: number} | {error: string}>} The loaded PDF or an error
 */
export async function loadPdf(url: string): Promise<{pdf: any, numPages: number} | {error: string}> {
  try {
    // Ensure worker is configured
    await configurePdfWorker();
    
    // Check if URL is from Cloudinary and if it's a raw resource
    let pdfUrl = url;
    if (isCloudinaryRawUrl(url)) {
      // Try to get a download URL for Cloudinary PDFs
      const downloadUrl = getDownloadUrl(url);
      if (downloadUrl !== url) {
        pdfUrl = downloadUrl;
      }
    }
    
  try {
      // Load the PDF
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdfDoc = await loadingTask.promise;
      
      return {
        pdf: pdfDoc,
        numPages: pdfDoc.numPages
      };
    } catch (error: any) {
      // If we get a 401/403 error and we haven't tried the download URL yet
      if ((error?.status === 401 || error?.status === 403) && isCloudinaryRawUrl(url) && pdfUrl === url) {
        // Convert the URL to a download URL
        const downloadUrl = url.replace('/raw/upload/', '/image/upload/fl_attachment/');
        
  try {
          const loadingTask = pdfjsLib.getDocument(downloadUrl);
          const pdfDoc = await loadingTask.promise;
          
          return {
            pdf: pdfDoc,
            numPages: pdfDoc.numPages
          };
        } catch (downloadError) {
          throw downloadError;
        }
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    console.error('PDF loading error:', error);
    return {
      error: error.message || 'Failed to load PDF'
    };
  }
}
