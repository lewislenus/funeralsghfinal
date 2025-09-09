# PDF Storage Setup Guide

## 🎯 **Recommended: Supabase Storage**

Supabase Storage is the best option for your funeral website because:
- ✅ You already have Supabase configured
- ✅ Free tier: 1GB storage + 2GB bandwidth/month
- ✅ Excellent integration with your existing setup
- ✅ Built-in authentication and security
- ✅ Global CDN for fast access
- ✅ Automatic backups

### **Step 1: Enable Supabase Storage**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (`nyuprxdfgqymaktktqwx`)
3. Navigate to **Storage** in the sidebar
4. Click **Create Bucket**
5. Create a bucket named `funeral-pdfs`
6. Set it as **Public** for easy access

### **Step 2: Set Up Storage Policies (Optional)**

For better security, you can set up Row Level Security:

```sql
-- Allow public read access to PDFs
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'funeral-pdfs');

-- Allow authenticated users to upload PDFs
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'funeral-pdfs' 
  AND auth.role() = 'authenticated'
);
```

### **Step 3: Initialize in Your App**

```typescript
// Add this to your app initialization
import { setupPdfStorage } from '@/lib/setup-pdf-storage';

// Call this when your app starts
await setupPdfStorage();
```

### **Step 4: Update Your Upload Components**

```typescript
import { uploadPdf } from '@/lib/pdf-storage-manager';

const handlePdfUpload = async (file: File, funeralId: string) => {
  try {
    const result = await uploadPdf(file, funeralId);
    
    // Update funeral record with PDF URL
    await supabase
      .from('funerals')
      .update({ brochure_url: result.url })
      .eq('id', funeralId);
      
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## 🔄 **Alternative: Enhanced Cloudinary**

If you prefer to stick with Cloudinary:

### **Step 1: Update Cloudinary Settings**

1. Go to Cloudinary dashboard: https://cloudinary.com/console
2. Navigate to **Settings** → **Upload**
3. Create a new upload preset:
   - Name: `funeral-pdfs`
   - Mode: **Unsigned**
   - Resource type: **Image** (for better public access)
   - Format: **PDF**
   - Access mode: **Public**

### **Step 2: Use Enhanced Upload**

```typescript
import { uploadPdfToCloudinary } from '@/lib/cloudinary-pdf';

const result = await uploadPdfToCloudinary(file);
// Result includes: url, thumbnails, directDownloadUrl
```

## 📁 **Local Storage (Development Only)**

For development/testing:

1. PDFs stored in `public/pdfs/`
2. Accessible at `/pdfs/filename.pdf`
3. No authentication needed
4. Files included in deployment

```typescript
import { savePdfLocally } from '@/lib/local-pdf-storage';

const url = await savePdfLocally(file, 'custom-name.pdf');
// Returns: /pdfs/custom-name.pdf
```

## 🚀 **Usage Examples**

### **Basic Upload**
```typescript
import { uploadPdf } from '@/lib/pdf-storage-manager';

const result = await uploadPdf(file, funeralId);
console.log('PDF URL:', result.url);
```

### **Upload with Fallback**
```typescript
// Automatically tries Supabase, then Cloudinary if it fails
const result = await uploadPdf(file, funeralId);
```

### **Upload to Multiple Providers**
```typescript
import { uploadPdfWithRedundancy } from '@/lib/pdf-storage-manager';

const results = await uploadPdfWithRedundancy(file, funeralId);
// Uploads to all available providers for redundancy
```

## 📊 **Storage Comparison**

| Feature | Supabase | Cloudinary | Local |
|---------|----------|------------|-------|
| Free Tier | 1GB + 2GB bandwidth | 25GB storage + 25GB bandwidth | Unlimited* |
| CDN | ✅ Global | ✅ Global | ❌ |
| Authentication | ✅ Built-in | ⚠️ Complex | ❌ |
| Thumbnails | ⚠️ Manual | ✅ Automatic | ❌ |
| Backups | ✅ Automatic | ✅ Automatic | ❌ |
| Integration | ✅ Perfect | ⚠️ Good | ✅ Simple |

*Limited by deployment size

## 🛠 **Implementation Checklist**

- [ ] Choose your storage provider
- [ ] Set up storage bucket/settings
- [ ] Initialize storage in your app
- [ ] Update upload components
- [ ] Test PDF uploads
- [ ] Update existing funeral records
- [ ] Set up error handling
- [ ] Configure CDN caching

## 🔧 **Quick Setup Commands**

```bash
# Install dependencies (if using Supabase)
npm install @supabase/auth-helpers-nextjs

# Run the setup
npm run dev
# Then visit /test-pdf to test uploads
```

## 🎯 **My Recommendation**

**Use Supabase Storage** because:
1. You already have it set up
2. Perfect integration with your auth system
3. Generous free tier
4. Reliable and fast
5. Easy to manage from dashboard

The unified PDF manager I created will handle all the complexity and provide automatic fallbacks if needed.
