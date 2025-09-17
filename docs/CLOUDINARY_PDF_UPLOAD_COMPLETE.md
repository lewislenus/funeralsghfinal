# Cloudinary PDF Upload System - Complete Setup Guide

## Overview

This system allows admins to upload PDF brochures via Cloudinary, store metadata in Supabase, and display them with flipbook functionality on funeral pages.

## Components Created/Updated

### 1. Database Schema (`scripts/create-brochure-table.sql`)
- **brochures** table with complete RLS policies
- Links to funerals table via `funeral_id`
- Stores PDF metadata, URLs, and thumbnails
- Admin and user access controls

### 2. Brochure API (`lib/api/brochure.ts`)
- Complete CRUD operations for brochures
- Type-safe with TypeScript interfaces
- Proper error handling and validation

### 3. Enhanced Cloudinary PDF Upload (`lib/cloudinary-pdf.ts`)
- Multiple upload methods with fallback
- Automatic thumbnail generation
- Better error handling and logging
- Public access configuration

### 4. Admin Brochure Upload Component (`components/admin-brochure-upload.tsx`)
- Complete upload interface for admins
- Real-time PDF preview with flipbook
- Upload progress and status feedback
- Manages multiple brochures per funeral

### 5. Enhanced Admin Dashboard (`app/admin/page.tsx`)
- Integrated brochure management
- Tabbed interface for funeral and brochure management
- Direct access to upload brochures for each funeral

### 6. Updated Funeral Event Page (`components/funeral-event-page.tsx`)
- Displays multiple brochures from database
- Fallback to legacy brochure_url if needed
- Enhanced viewing options with download/view buttons

## Setup Instructions

### 1. Database Setup

First, run the brochure table creation script:

```sql
-- Run this in your Supabase SQL Editor
-- File: scripts/create-brochure-table.sql
```

### 2. Environment Variables

Update your `.env.local` file with Cloudinary credentials:

```bash
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add these Cloudinary variables
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyfr1ppe8
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 3. Cloudinary Setup

1. Go to your Cloudinary Dashboard
2. Get your API credentials from the Dashboard
3. Ensure you have an upload preset named "website-cursor" 
4. Or update the preset name in `lib/cloudinary-pdf.ts`

### 4. Testing the System

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the admin dashboard:**
   - Go to `http://localhost:3001/admin`
   - Login with admin email: `funeralsghana@gmail.com`

3. **Upload a brochure:**
   - Go to "Brochure Management" tab
   - Select a funeral from "Funeral Management" 
   - Click the "Brochure" button
   - Upload a PDF file
   - Add title and description
   - Save the brochure

4. **View on funeral page:**
   - Go to any funeral page: `http://localhost:3001/funeral/[id]`
   - Brochures should appear in the "Funeral Brochures" section
   - Test the flipbook functionality

## Features

### For Admins:
- ✅ Upload multiple PDF brochures per funeral
- ✅ Real-time preview with flipbook mode
- ✅ Automatic thumbnail generation via Cloudinary
- ✅ Manage brochure titles and descriptions
- ✅ View/download/delete brochures
- ✅ Integrated admin dashboard

### For Website Visitors:
- ✅ View brochures in stunning flipbook mode
- ✅ Download brochures directly
- ✅ Multiple brochures per funeral
- ✅ Responsive design for all devices
- ✅ Fast loading with Cloudinary CDN

### Technical Features:
- ✅ Multiple upload methods with automatic fallback
- ✅ Comprehensive error handling
- ✅ Type-safe TypeScript throughout
- ✅ Proper RLS security policies
- ✅ Real-time upload progress
- ✅ Automatic file validation (PDF only, 10MB max)

## API Endpoints

The system uses these API endpoints:

- `brochureAPI.getBrochuresForFuneral(funeralId)` - Get all brochures for a funeral
- `brochureAPI.createBrochure(brochureData)` - Create a new brochure
- `brochureAPI.updateBrochure(id, updates)` - Update brochure details
- `brochureAPI.deleteBrochure(id)` - Delete a brochure

## File Upload Flow

1. **User selects PDF** in admin dashboard
2. **File validation** (PDF only, max 10MB)
3. **Upload to Cloudinary** with thumbnail generation
4. **Save metadata** to Supabase brochures table
5. **Display success** with preview option
6. **Show on website** in flipbook viewer

## Troubleshooting

### Common Issues:

1. **Upload fails with "Invalid upload preset"**
   - Check Cloudinary upload preset name in `lib/cloudinary-pdf.ts`
   - Ensure preset exists and is configured correctly

2. **Database permission errors**
   - Run the RLS policies script: `scripts/create-brochure-table.sql`
   - Ensure admin email matches in RLS policies

3. **Brochures not showing on funeral pages**
   - Check if brochures table has data
   - Verify funeral_id matches correctly
   - Check browser console for API errors

4. **PDF not displaying in flipbook**
   - Check if PDF URL is accessible
   - Verify PDF.js worker is copied correctly
   - Check browser console for PDF.js errors

## Development Notes

- The system uses **Cloudinary's image resource type** with PDF format for better public access
- **Automatic fallback** to raw upload if image upload fails
- **Legacy support** for existing `brochure_url` field in funerals table
- **Progressive enhancement** - works with or without database brochures

## Security

- RLS policies ensure users can only access appropriate brochures
- Admin access controlled by email verification
- File type validation prevents non-PDF uploads
- File size limits prevent large uploads

---

The PDF upload system is now fully functional and ready for production use! 🎉
