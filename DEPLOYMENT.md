# Netlify Deployment Guide

## ✅ Build Status
✅ Build completed successfully with npm!
✅ Lockfile updated (using npm instead of pnpm)
✅ All dependencies resolved
✅ Environment variable handling fixed

## Files Created for Deployment
- `netlify.toml` - Netlify configuration with build settings and security headers
- `package-lock.json` - Updated dependency lockfile (npm)
- Production build in `.next/` directory

## ⚠️ Important: Lockfile Fix Applied
- **Removed**: `pnpm-lock.yaml` (outdated)
- **Created**: Fresh `package-lock.json` with npm
- **Result**: Resolves Netlify build error with frozen lockfile

## 🔧 Required Environment Variables

Before deploying, set these environment variables in your Netlify dashboard:

### Supabase Configuration (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Cloudinary Configuration (Optional)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📝 How to Set Environment Variables in Netlify

1. Go to your Netlify site dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Click **Add a variable** for each required variable
4. Add the variable name and value
5. Click **Save**

## 🚀 Deployment Steps

1. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** Auto-detected by Netlify
   - **Node version:** 18.x or higher

3. **Set Environment Variables** (see section above)

4. **Deploy:**
   - Netlify will automatically build and deploy
   - Your site will be live with a generated URL

## Pre-Deployment Checklist

### 1. Environment Variables
Make sure to set these in your Netlify dashboard under Site settings > Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Supabase Setup
- Create the `funeral-pdfs` bucket in your Supabase Storage
- Set up RLS policies for the bucket
- Ensure your database tables are created with the scripts in `/scripts/`

### 3. Deployment Steps

1. **Push to Git Repository**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub/GitLab/Bitbucket repository
   - Choose the repository: `funeralsghfinal`

3. **Build Settings** (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x or higher

4. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete

## Build Output Summary
- ✅ 21 static pages generated
- ✅ API routes configured as serverless functions
- ✅ PDF.js worker copied to public directory
- ✅ All test pages removed
- ✅ Production optimizations applied

## Performance Features Included
- Image optimization with Next.js Image component
- Static generation where possible
- PDF.js worker for client-side PDF rendering
- Responsive defaults (mobile-first)
- Security headers configured

## Post-Deployment
1. Test all PDF viewers work correctly
2. Verify image loading and LCP metrics
3. Test funeral creation and brochure upload
4. Check mobile responsiveness

## Notes
- The build warnings about missing Supabase bucket are expected during build time
- PDF functionality will work once environment variables are properly set
- All test routes have been removed for production