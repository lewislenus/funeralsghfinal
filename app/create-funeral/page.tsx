"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FuneralsAPI, FuneralInsert, FuneralUpdate } from '@/lib/api/funerals';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { createClient } from '@/lib/supabase/client';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { uploadPdf } from '@/lib/pdf-storage-manager';

const formSchema = z.object({
  deceased_name: z.string().min(1, 'Deceased name is required'),
  family_name: z.string().optional().nullable(),
  family_contact: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  date_of_death: z.string().optional().nullable(),
  funeral_date: z.string().min(1, 'Funeral date is required'),
  funeral_time: z.string().optional().nullable(),
  venue: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  funeral_location: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  organized_by: z.string().optional().nullable(),
  life_story: z.string().optional().nullable(),
  image_url: z.string().url().optional().or(z.literal('')).nullable(),
  poster_url: z.string().url().optional().or(z.literal('')).nullable(),
  gallery_urls: z.array(z.string().url()).optional().nullable(),
  brochure_url: z.string().url().optional().or(z.literal('')).nullable(),
  livestream_url: z.string().url().optional().or(z.literal('')).nullable(),
  is_public: z.boolean().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

function CreateFuneralContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState({
    poster: false,
    brochure: false,
    gallery: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [funeralData, setFuneralData] = useState<any>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const funeralsAPI = new FuneralsAPI();
  const funeralId = searchParams.get('id');
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deceased_name: '',
      family_name: '',
      region: '',
      location: '',
      venue: '',
      family_contact: '',
      date_of_birth: '',
      date_of_death: '',
      funeral_date: '',
      funeral_time: '',
      life_story: '',
      poster_url: '',
      brochure_url: '',
      livestream_url: '',
      is_public: true
    }
  });

  useEffect(() => {
    const fetchFuneralData = async () => {
      if (!funeralId) {
        setIsLoading(false);
        return;
      }
      
      setIsEditMode(true);
      try {
        const { data, error: fetchError } = await funeralsAPI.getFuneral(funeralId);
        if (fetchError) {
          throw new Error(fetchError);
        }
        if (data) {
          // Populate form with fetched data
          Object.keys(data).forEach(key => {
            const formKey = key as keyof FormData;
            let value = data[key as keyof typeof data];

            // Format dates for input[type=date]
            if ((key === 'date_of_birth' || key === 'date_of_death' || key === 'funeral_date') && value && typeof value === 'string') {
                value = value.split('T')[0];
            }

            if (formKey in formSchema.shape && value !== null && value !== undefined) {
              if (formKey === 'gallery_urls' && Array.isArray(value)) {
                setGalleryUrls(value);
              } else {
                setValue(formKey, String(value));
              }
            }
          });
        } else {
          throw new Error('Funeral data not found.');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch funeral data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFuneralData();
  }, [funeralId, setValue]);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to perform this action.');

      const processedData: any = {};
      for (const key in formData) {
        const typedKey = key as keyof FormData;
        if (formData[typedKey] === '') {
          processedData[typedKey] = null;
        } else {
          processedData[typedKey] = formData[typedKey];
        }
      }
      
      // Add gallery URLs to processed data
      if (galleryUrls.length > 0) {
        processedData.gallery_urls = galleryUrls;
      }

      if (isEditMode && funeralId) {
        const updateData: Omit<FuneralUpdate, 'id'> = { ...processedData, user_id: user.id };
        const { error: updateError } = await funeralsAPI.updateFuneral(funeralId, updateData);
        if (updateError) throw new Error(updateError);
        router.push('/dashboard');
      } else {
        const insertData: FuneralInsert = { ...(processedData as FuneralInsert), user_id: user.id, status: 'pending' };
        const { error: insertError } = await funeralsAPI.createFuneral(insertData);
        if (insertError) throw new Error(insertError);
        router.push('/dashboard?new=true');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload handlers
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FormData
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    setError(null);

    try {
      const url = await uploadToCloudinary(file, "image");
      setValue(field, url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to upload ${field.replace('_', ' ')}. ${errorMessage}`);
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, gallery: true }));
    setError(null);

    try {
      const urls = await uploadMultipleToCloudinary(files, "image");
      setGalleryUrls(prev => [...prev, ...urls]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to upload gallery images. ${errorMessage}`);
    } finally {
      setUploading(prev => ({ ...prev, gallery: false }));
    }
  };

  const handleBrochureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, brochure: true }));
    setError(null);

    try {
      // Use the new unified PDF storage manager (Supabase first, Cloudinary fallback)
      const result = await uploadPdf(file, funeralId || 'new-funeral');
      console.log("Uploaded PDF via", result.provider, "- URL:", result.url);
      setValue('brochure_url', result.url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Failed to upload brochure. ${errorMessage}`);
    } finally {
      setUploading(prev => ({ ...prev, brochure: false }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Funeral Announcement' : 'Create Funeral Announcement'}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading form...</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="deceased_name" className="block text-sm font-medium text-slate-700 mb-1">Deceased's Full Name *</label>
                      <Input id="deceased_name" {...register('deceased_name')} />
                      {errors.deceased_name && <p className="text-red-500 text-sm mt-1">{errors.deceased_name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="organized_by" className="block text-sm font-medium text-slate-700 mb-1">Organized By</label>
                      <Input id="organized_by" {...register('organized_by')} placeholder="e.g., The Dago Family" />
                    </div>
                    <div>
                      <label htmlFor="date_of_birth" className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                      <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
                    </div>
                    <div>
                      <label htmlFor="date_of_death" className="block text-sm font-medium text-slate-700 mb-1">Date of Death</label>
                      <Input id="date_of_death" type="date" {...register('date_of_death')} />
                    </div>
                  </div>
                </div>

                {/* Family Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700">Family Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="family_name" className="block text-sm font-medium text-slate-700 mb-1">Family Name</label>
                      <Input id="family_name" {...register('family_name')} placeholder="e.g., Dago Family" />
                    </div>
                    <div>
                      <label htmlFor="family_contact" className="block text-sm font-medium text-slate-700 mb-1">Family Contact</label>
                      <Input id="family_contact" {...register('family_contact')} placeholder="Phone number or email" />
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700">Service Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="funeral_date" className="block text-sm font-medium text-slate-700 mb-1">Funeral Date *</label>
                      <Input id="funeral_date" type="date" {...register('funeral_date')} />
                      {errors.funeral_date && <p className="text-red-500 text-sm mt-1">{errors.funeral_date.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="funeral_time" className="block text-sm font-medium text-slate-700 mb-1">Funeral Time</label>
                      <Input id="funeral_time" type="time" {...register('funeral_time')} />
                    </div>
                    <div>
                      <label htmlFor="venue" className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                      <Input id="venue" {...register('venue')} placeholder="Church, funeral home, etc." />
                    </div>
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                      <Input id="region" {...register('region')} placeholder="e.g., Greater Accra" />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location (City/Town)</label>
                      <Input id="location" {...register('location')} placeholder="e.g., Accra" />
                    </div>
                    <div>
                      <label htmlFor="funeral_location" className="block text-sm font-medium text-slate-700 mb-1">Detailed Address</label>
                      <Input id="funeral_location" {...register('funeral_location')} placeholder="Full address or GPS coordinates" />
                    </div>
                  </div>
                </div>

                {/* Life Story */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700">Life Story</h3>
                  <div>
                    <label htmlFor="life_story" className="block text-sm font-medium text-slate-700 mb-1">Biography / Life Story</label>
                    <Textarea 
                      id="life_story" 
                      {...register('life_story')} 
                      rows={6}
                      placeholder="Share the life story, achievements, and memories of the deceased..."
                    />
                  </div>
                </div>

                {/* Media & Documents */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-700">Media & Documents</h3>
                  
                  {/* Funeral Poster Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Funeral Poster Image</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'poster_url')}
                        className="flex-1"
                      />
                      {uploading.poster && (
                        <span className="text-sm text-blue-600">Uploading...</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">Or enter URL manually:</div>
                    <Input {...register('poster_url')} placeholder="https://..." />
                    {errors.poster_url && <p className="text-red-500 text-sm">{errors.poster_url.message}</p>}
                  </div>

                  {/* Cover Image Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Cover Image</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image_url')}
                        className="flex-1"
                      />
                      {uploading.gallery && (
                        <span className="text-sm text-blue-600">Uploading...</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">Or enter URL manually:</div>
                    <Input {...register('image_url')} placeholder="https://..." />
                    {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
                  </div>

                  {/* Gallery Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Gallery Images</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="flex-1"
                      />
                      {uploading.gallery && (
                        <span className="text-sm text-blue-600">Uploading gallery...</span>
                      )}
                    </div>
                    {galleryUrls.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">Gallery Preview:</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {galleryUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Brochure Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Funeral Brochure (PDF)</label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleBrochureUpload}
                        className="flex-1"
                      />
                      {uploading.brochure && (
                        <span className="text-sm text-blue-600">Uploading...</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">Or enter URL manually:</div>
                    <Input {...register('brochure_url')} placeholder="https://..." />
                    {errors.brochure_url && <p className="text-red-500 text-sm">{errors.brochure_url.message}</p>}
                  </div>

                  {/* Livestream URL */}
                  <div className="space-y-3">
                    <label htmlFor="livestream_url" className="block text-sm font-medium text-slate-700">Livestream URL</label>
                    <Input id="livestream_url" {...register('livestream_url')} placeholder="https://youtube.com/watch?v=... or https://facebook.com/..." />
                    {errors.livestream_url && <p className="text-red-500 text-sm">{errors.livestream_url.message}</p>}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700">Settings</h3>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="is_public" 
                      {...register('is_public')}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="is_public" className="text-sm font-medium text-slate-700">
                      Make this funeral announcement public
                    </label>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (isEditMode ? 'Update Funeral' : 'Create Funeral')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}

export default function CreateFuneralPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateFuneralContent />
    </Suspense>
  );
}

