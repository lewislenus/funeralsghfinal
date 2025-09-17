"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Download,
  Trash2,
  Edit
} from "lucide-react";
import { uploadPdfSmart, getStorageInfo } from "@/lib/pdf-storage-manager";
import { brochureAPI, type BrochureInsert } from "@/lib/api/brochure";
import { PdfDisplay } from "@/components/pdf-display";
import { 
  compressPdfIfNeeded, 
  formatFileSize, 
  isPdfFile, 
  getFileSizeMB,
  type CompressionResult 
} from "@/lib/pdf-compressor";

interface AdminBrochureUploadProps {
  funeralId: string;
  onUploadComplete?: () => void;
  existingBrochures?: any[];
}

export function AdminBrochureUpload({ 
  funeralId, 
  onUploadComplete,
  existingBrochures = []
}: AdminBrochureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    url: string;
    thumbnailUrls: string[];
    publicId: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPdfFile(file)) {
      setError("Please select a PDF file");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setCompressionResult(null);

    try {
      console.log("Starting PDF upload for funeral:", funeralId);
      console.log(`Original file size: ${formatFileSize(file.size)}`);
      
      // Get storage info for the file
      const storageInfo = getStorageInfo(file);
      console.log(`Recommended provider: ${storageInfo.recommendedProvider}`);
      console.log(`File size: ${storageInfo.fileSizeMB.toFixed(2)}MB`);
      
      // Use smart upload which handles compression and provider selection automatically
      const result = await uploadPdfSmart(file, funeralId);
      
      console.log("Upload successful:", result);
      console.log(`Used provider: ${result.provider}`);
      
      // Set compression result if compression was performed
      if (result.compressionInfo) {
        setCompressionResult(result.compressionInfo);
        console.log(`File compressed from ${formatFileSize(result.compressionInfo.originalSize)} to ${formatFileSize(result.compressionInfo.compressedSize)} (${(result.compressionInfo.compressionRatio * 100).toFixed(1)}% of original)`);
      }
      
      // Transform result to match expected format
      setUploadResult({
        url: result.url,
        thumbnailUrls: result.metadata?.thumbnails || [],
        publicId: result.metadata?.publicId || ''
      });
      
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace('.pdf', '')
        }));
      }
      
      let successMessage = `PDF uploaded successfully to ${result.provider}!`;
      if (result.compressionInfo?.wasCompressed) {
        successMessage += ` File was compressed from ${formatFileSize(result.compressionInfo.originalSize)} to ${formatFileSize(result.compressionInfo.compressedSize)}.`;
      }
      setSuccess(successMessage);
    } catch (err) {
      console.error("Upload failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBrochure = async () => {
    if (!uploadResult) {
      setError("Please upload a PDF first");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const brochureData: BrochureInsert = {
        funeral_id: funeralId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        pdf_url: uploadResult.url,
        thumbnail_url: uploadResult.thumbnailUrls[0] || null,
        cloudinary_public_id: uploadResult.publicId,
        upload_type: 'cloudinary',
        is_active: true,
        display_order: existingBrochures.length
      };

      const { data, error: saveError } = await brochureAPI.createBrochure(brochureData);
      
      if (saveError) {
        throw new Error(saveError);
      }

      console.log("Brochure saved successfully:", data);
      setSuccess("Brochure saved successfully and added to the funeral!");
      
      // Reset form
      setUploadResult(null);
      setFormData({ title: "", description: "" });
      
      // Clear file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Notify parent component
      onUploadComplete?.();
      
    } catch (err) {
      console.error("Save failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(`Failed to save brochure: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const clearUpload = () => {
    setUploadResult(null);
    setFormData({ title: "", description: "" });
    setError(null);
    setSuccess(null);
    setCompressionResult(null);
    
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Funeral Brochure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">Select PDF File</Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading || saving}
            />
            <p className="text-sm text-slate-600">
              Maximum file size: 10MB. Files larger than 10MB will be automatically compressed.
            </p>
          </div>

          {/* Upload Status */}
          {uploading && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-700">
                {compressionResult?.wasCompressed 
                  ? `Compressing and uploading PDF...` 
                  : `Uploading PDF to Cloudinary...`}
              </span>
            </div>
          )}

          {/* Compression Info */}
          {compressionResult?.wasCompressed && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700 font-medium">File Compressed</span>
              </div>
              <div className="text-sm text-amber-600 space-y-1">
                <div>Original size: {formatFileSize(compressionResult.originalSize)}</div>
                <div>Compressed size: {formatFileSize(compressionResult.compressedSize)}</div>
                <div>Compression ratio: {(compressionResult.compressionRatio * 100).toFixed(1)}%</div>
              </div>
            </div>
          )}

          {/* Upload Success */}
          {uploadResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">PDF uploaded successfully!</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="ml-auto"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? 'Hide' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearUpload}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>

              {/* PDF Preview */}
              {previewMode && (
                <div className="border rounded-lg p-4 bg-slate-50">
                  <h4 className="font-medium mb-2">PDF Preview:</h4>
                  <PdfDisplay 
                    pdfUrl={uploadResult.url}
                    title="Brochure Preview"
                    mode="inline"
                    height="400px"
                  />
                </div>
              )}

              {/* Brochure Details Form */}
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-medium">Brochure Details</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="brochure-title">Title *</Label>
                  <Input
                    id="brochure-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter brochure title..."
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brochure-description">Description</Label>
                  <Textarea
                    id="brochure-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter brochure description (optional)..."
                    rows={3}
                    disabled={saving}
                  />
                </div>

                <Button 
                  onClick={handleSaveBrochure}
                  disabled={saving || !formData.title.trim()}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Save Brochure
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Existing Brochures */}
      {existingBrochures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Existing Brochures ({existingBrochures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {existingBrochures.map((brochure, index) => (
                <div key={brochure.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{brochure.title}</h4>
                    {brochure.description && (
                      <p className="text-sm text-slate-600">{brochure.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={brochure.is_active ? "default" : "secondary"}>
                        {brochure.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {brochure.upload_type || 'cloudinary'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(brochure.pdf_url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = brochure.pdf_url;
                        link.download = `${brochure.title}.pdf`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}