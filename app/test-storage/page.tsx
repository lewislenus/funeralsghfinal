"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadPdf, initializePdfStorage } from "@/lib/pdf-storage-manager";
import { uploadPdfToSupabase } from "@/lib/supabase-storage";
import { CheckCircle, AlertCircle, Upload, Loader2 } from "lucide-react";

export default function SupabaseStorageTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [bucketStatus, setBucketStatus] = useState<string>("Checking...");

  // Test bucket connection
  const testBucketConnection = async () => {
    try {
      setBucketStatus("Testing connection...");
      await initializePdfStorage();
      setBucketStatus("✅ Bucket connected successfully!");
    } catch (error: any) {
      setBucketStatus(`❌ Connection failed: ${error.message}`);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  // Test upload using unified manager
  const testUnifiedUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const uploadResult = await uploadPdf(file, "test-funeral");
      setResult({
        type: "unified",
        url: uploadResult.url,
        provider: uploadResult.provider,
        metadata: uploadResult.metadata
      });
    } catch (error: any) {
      setError(`Unified upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Test direct Supabase upload
  const testDirectSupabaseUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const uploadResult = await uploadPdfToSupabase(file, "test-funeral");
      setResult({
        type: "direct-supabase",
        url: uploadResult.url,
        path: uploadResult.path,
        publicUrl: uploadResult.publicUrl
      });
    } catch (error: any) {
      setError(`Direct Supabase upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Supabase PDF Storage Test</h1>
      
      {/* Bucket Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Bucket Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm">{bucketStatus}</p>
            <Button onClick={testBucketConnection} variant="outline" size="sm">
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select PDF File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <div className="text-sm text-slate-600">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Unified Manager Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Uses the unified PDF manager with automatic fallbacks
            </p>
            <Button 
              onClick={testUnifiedUpload} 
              disabled={!file || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Test Unified Upload
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Supabase Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Direct upload to your Supabase bucket
            </p>
            <Button 
              onClick={testDirectSupabaseUpload} 
              disabled={!file || uploading}
              variant="outline"
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Test Direct Upload
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Result Display */}
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Upload Successful!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong>Upload Type:</strong> {result.type}
              </div>
              <div>
                <strong>URL:</strong>{" "}
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {result.url}
                </a>
              </div>
              {result.provider && (
                <div>
                  <strong>Provider:</strong> {result.provider}
                </div>
              )}
              {result.path && (
                <div>
                  <strong>Storage Path:</strong> {result.path}
                </div>
              )}
              {result.metadata && (
                <div>
                  <strong>Metadata:</strong>
                  <pre className="mt-2 p-3 bg-slate-100 rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Test PDF Viewer */}
              <div className="pt-4">
                <Button 
                  onClick={() => window.open(result.url, '_blank')} 
                  variant="outline"
                  className="w-full"
                >
                  Open PDF in New Tab
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>✅ Supabase bucket created successfully!</p>
            <p>✅ PDF storage system configured</p>
            <p>📝 Test your uploads using the form above</p>
            <p>🔧 Once tested, integrate into your funeral forms</p>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Integration Code:</h4>
              <pre className="text-xs text-blue-800 overflow-x-auto">
{`import { uploadPdf } from '@/lib/pdf-storage-manager';

const handlePdfUpload = async (file: File, funeralId: string) => {
  const result = await uploadPdf(file, funeralId);
  
  // Update funeral record
  await supabase
    .from('funerals')
    .update({ brochure_url: result.url })
    .eq('id', funeralId);
};`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
