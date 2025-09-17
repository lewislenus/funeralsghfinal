import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@supabase/supabase-js";

export type Brochure = {
  id: string;
  funeral_id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  thumbnail_url: string | null;
  cloudinary_public_id: string | null;
  file_size: number | null;
  page_count: number | null;
  upload_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type BrochureInsert = {
  funeral_id: string;
  title: string;
  description?: string | null;
  pdf_url: string;
  thumbnail_url?: string | null;
  cloudinary_public_id?: string | null;
  file_size?: number | null;
  page_count?: number | null;
  upload_type?: string;
  is_active?: boolean;
  display_order?: number;
  created_by?: string | null;
};

export type BrochureUpdate = {
  title?: string;
  description?: string | null;
  pdf_url?: string;
  thumbnail_url?: string | null;
  cloudinary_public_id?: string | null;
  file_size?: number | null;
  page_count?: number | null;
  upload_type?: string;
  is_active?: boolean;
  display_order?: number;
};

function getSupabase() {
  if (typeof window === "undefined") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build';
    
    // Only warn in production when not building
    if (process.env.NODE_ENV === 'production' && 
        process.env.NEXT_PHASE !== 'phase-production-build' &&
        (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      console.warn("Missing Supabase environment variables in production");
    }
    
    return createServerClient(url, key);
  }
  return createBrowserClient();
}

export class BrochureAPI {
  private supabase = getSupabase();

  private checkEnvironment() {
    const hasValidCredentials = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://dummy.supabase.co' &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'dummy-key-for-build';
    
    if (!hasValidCredentials) {
      throw new Error('Supabase is not configured. Please set environment variables.');
    }
  }

  async getBrochuresForFuneral(funeralId: string): Promise<{
    data: Brochure[];
    error: string | null;
  }> {
    try {
      this.checkEnvironment();
      
      if (!funeralId || typeof funeralId !== 'string') {
        return { data: [], error: "Invalid funeral ID" };
      }

      // Validate UUID to avoid Postgres 22P02 errors when provided ids like "4" or slugs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(funeralId)) {
        // Not a UUID: gracefully return empty set without hitting RPC
        return { data: [], error: null };
      }

      const { data, error } = await this.supabase
        .rpc('get_brochures_for_funeral' as any, { funeral_id_param: funeralId });

      if (error) {
        console.error("Error fetching brochures:", error);
        return { data: [], error: error.message };
      }

      return { data: (data as any) || [], error: null };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  async getAllBrochures(): Promise<{
    data: Brochure[];
    error: string | null;
  }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_all_brochures_with_funerals' as any);

      if (error) {
        console.error("Error fetching all brochures:", error);
        return { data: [], error: error.message };
      }

      return { data: (data as any[]) || [], error: null };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  async createBrochure(brochure: BrochureInsert): Promise<{
    data: Brochure | null;
    error: string | null;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      const brochureData: BrochureInsert = {
        ...brochure,
        created_by: user?.id || null,
        upload_type: brochure.upload_type || 'cloudinary',
        is_active: brochure.is_active !== undefined ? brochure.is_active : true,
        display_order: brochure.display_order || 0
      };

      const { data, error } = await this.supabase
        .rpc('create_brochure' as any, brochureData);

      if (error) {
        console.error("Error creating brochure:", error);
        return { data: null, error: error.message };
      }

      return { data: data as any, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  async updateBrochure(id: string, updates: BrochureUpdate): Promise<{
    data: Brochure | null;
    error: string | null;
  }> {
    try {
      if (!id || typeof id !== 'string') {
        return { data: null, error: "Invalid brochure ID" };
      }

      const { data, error } = await this.supabase
        .rpc('update_brochure' as any, {
          brochure_id: id,
          updates: updates
        });

      if (error) {
        console.error("Error updating brochure:", error);
        return { data: null, error: error.message };
      }

      return { data: data as any, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  async deleteBrochure(id: string): Promise<{ error: string | null }> {
    try {
      if (!id || typeof id !== 'string') {
        return { error: "Invalid brochure ID" };
      }

      const { error } = await this.supabase
        .rpc('delete_brochure' as any, {
          brochure_id: id
        });

      if (error) {
        console.error("Error deleting brochure:", error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    }
  }

  async toggleBrochureStatus(id: string, isActive: boolean): Promise<{
    data: Brochure | null;
    error: string | null;
  }> {
    return this.updateBrochure(id, { is_active: isActive });
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<{
    data: Brochure | null;
    error: string | null;
  }> {
    return this.updateBrochure(id, { display_order: displayOrder });
  }
}

export const brochureAPI = new BrochureAPI();