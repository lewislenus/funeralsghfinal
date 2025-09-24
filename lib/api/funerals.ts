// Choose the appropriate Supabase client based on runtime (server vs browser)
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type Funeral = Database["public"]["Tables"]["funerals"]["Row"];
export type FuneralInsert = Database["public"]["Tables"]["funerals"]["Insert"];
export type FuneralUpdate = Database["public"]["Tables"]["funerals"]["Update"];

export interface FuneralWithStats extends Funeral {
  condolences_count: number;
  donations_total: number;
  donations_count: number;
  // UI-friendly properties for admin page
  deceased?: string;
  organizer?: string;
  date?: string;
  submittedAt?: string;
}

export interface FuneralFilters {
  search?: string;
  region?: string;
  status?: "upcoming" | "past" | "all";
  dateRange?: "week" | "month" | "all";
  sortBy?: "date" | "name" | "recent" | "popular";
  limit?: number;
  offset?: number;
}

function getSupabase() {
  // Check if we're in a server environment
  if (typeof window === "undefined") {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key-for-build';
    
    // Only warn in production when not building
    if (process.env.NODE_ENV === 'production' && 
        process.env.NEXT_PHASE !== 'phase-production-build' &&
        (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
      console.warn("Missing Supabase environment variables in production");
    }
    
    // Server-side: use createClient from supabase-js directly
    return createServerClient<Database>(url, key);
  }
  // Client-side: use the component client
  return createBrowserClient();
}

export class FuneralsAPI {
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

  private transformFuneralData(rawData: any): FuneralWithStats {
    const condolences_count = Array.isArray(rawData.condolences)
      ? rawData.condolences[0]?.count ?? 0
      : 0;

    const donations_total = Array.isArray(rawData.donations)
      ? rawData.donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
      : 0;
    const donations_count = Array.isArray(rawData.donations)
      ? rawData.donations.length
      : 0;

    const { condolences, donations, ...rest } = rawData;

    return {
      ...rest,
      condolences_count,
      donations_total,
      donations_count,
      views_count: rawData.views_count || 0,
    } as FuneralWithStats;
  }

  async getAllFunerals(): Promise<{
    data: FuneralWithStats[];
    count: number;
    error: string | null;
  }> {
    try {
      this.checkEnvironment();
      
      const { data, count, error } = await this.supabase
        .from("funerals")
        .select("*, condolences(count), donations(amount)", { count: "exact" });

      if (error) {
        return { data: [], count: 0, error: error.message };
      }

      const funeralsWithStats: FuneralWithStats[] =
        data?.map(this.transformFuneralData) || [];

      return { data: funeralsWithStats, count: count || 0, error: null };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  async getFunerals(filters: FuneralFilters = {}): Promise<{
    data: FuneralWithStats[];
    count: number;
    error: string | null;
  }> {
    try {
      let query = this.supabase
        .from("funerals")
        .select("*, condolences(count), donations(amount)", { count: "exact" });

      // Only show approved funerals by default
      query = query.eq("status", "approved");

      // Only show visible funerals (hide/show functionality)
      query = query.eq("is_visible", true);

      // Apply search filter
      if (filters.search) {
        query = query.or(
          `deceased_name.ilike.%${filters.search}%,family_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%,venue.ilike.%${filters.search}%`
        );
      }

      // Apply region filter
      if (filters.region && filters.region !== "all") {
        query = query.eq("region", filters.region);
      }

      // Apply status filter (upcoming/past)
      if (filters.status === "upcoming") {
        query = query.gte(
          "funeral_date",
          new Date().toISOString().split("T")[0]
        );
      } else if (filters.status === "past") {
        query = query.lt(
          "funeral_date",
          new Date().toISOString().split("T")[0]
        );
      }

      // Apply date range filter
      if (filters.dateRange === "week") {
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        query = query.lte(
          "funeral_date",
          oneWeekFromNow.toISOString().split("T")[0]
        );
      } else if (filters.dateRange === "month") {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        query = query.lte(
          "funeral_date",
          oneMonthFromNow.toISOString().split("T")[0]
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "date":
          query = query.order("funeral_date", { ascending: true });
          break;
        case "name":
          query = query.order("deceased_name", { ascending: true });
          break;
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("views_count", { ascending: false });
          break;
        default:
          query = query.order("funeral_date", { ascending: true });
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data: funerals, error, count } = await query;

      if (error) {
        console.error("Supabase query error:", error)
        return { data: [], count: 0, error: error.message };
      }

      const funeralsWithStats: FuneralWithStats[] =
        funerals?.map(this.transformFuneralData) || [];

      return { data: funeralsWithStats, count: count || 0, error: null };
    } catch (error) {
      console.error("Unexpected error in getFunerals:", error)
      return {
        data: [],
        count: 0,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  async getFuneral(id: string): Promise<{
    data: FuneralWithStats | null;
    error: string | null;
  }> {
    try {
      if (!id || typeof id !== 'string') {
        return { data: null, error: "Invalid funeral ID" };
      }

      // Accept either UUIDs or numeric IDs
      const isNumeric = /^\d+$/.test(id);
      const idFilterValue: any = isNumeric ? Number(id) : id;

      const { data, error } = await this.supabase
        .from("funerals")
        .select("*, condolences(count), donations(amount)")
        .eq("id", idFilterValue)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: "Funeral not found" };
      }

      await this.incrementViews(data.id);

      const funeralWithStats: FuneralWithStats = this.transformFuneralData(data);

      return { data: funeralWithStats, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  async createFuneral(funeral: FuneralInsert): Promise<{
    data: Funeral | null;
    error: string | null;
  }> {
    try {
      const { data, error } = await this.supabase
        .from("funerals")
        .insert(funeral)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  async updateFuneral(
    id: string,
    updates: Omit<FuneralUpdate, "id">
  ): Promise<{
    data: Funeral | null;
    error: string | null;
  }> {
    try {
      if (!id || typeof id !== 'string') {
        return { data: null, error: "Invalid funeral ID" };
      }

      const { data, error } = await this.supabase
        .from("funerals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating funeral:", error);
        return {
          data: null,
          error: "Failed to update funeral",
        };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error updating funeral:", err);
      return {
        data: null,
        error: "An unexpected error occurred",
      };
    }
  }

  async toggleFuneralVisibility(
    id: string,
    isVisible: boolean
  ): Promise<{
    data: Funeral | null;
    error: string | null;
  }> {
    try {
      if (!id || typeof id !== 'string') {
        return { data: null, error: "Invalid funeral ID" };
      }

      const { data, error } = await this.supabase
        .from("funerals")
        .update({ is_visible: isVisible })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error toggling funeral visibility:", error);
        return {
          data: null,
          error: "Failed to toggle funeral visibility",
        };
      }

      return { data, error: null };
    } catch (err) {
      console.error("Unexpected error toggling funeral visibility:", err);
      return {
        data: null,
        error: "An unexpected error occurred",
      };
    }
  }

  async deleteFuneral(id: string): Promise<{ error: string | null }> {
    try {
      if (!id || typeof id !== 'string') {
        return { error: "Invalid funeral ID" };
      }

      const { error } = await this.supabase
        .from("funerals")
        .delete()
        .eq("id", id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  private async incrementViews(id: string): Promise<void> {
    try {
      if (id && typeof id === 'string') {
        // Validate UUID format before making the call
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (!isUuid) {
          console.error("Invalid UUID format for incrementViews:", id);
          return;
        }
        
        // Call the RPC function with the correct parameter name
        await this.supabase.rpc("increment_funeral_views", { funeral_uuid: id });
      }
    } catch (error) {
      console.error("Failed to increment views:", error);
    }
  }

  async getFeaturedFunerals(limit = 6): Promise<{
    data: FuneralWithStats[];
    error: string | null;
  }> {
    try {
      this.checkEnvironment();
      
      const { data: funerals, error } = await this.supabase
        .from("funerals")
        .select("*, condolences(count), donations(amount)")
        .eq("status", "approved")
        .eq("featured", true)
        .order("funeral_date", { ascending: true })
        .limit(limit);

      if (error) {
        return { data: [], error: error.message };
      }

      const funeralsWithStats: FuneralWithStats[] = funerals.map(
        this.transformFuneralData
      );

      return { data: funeralsWithStats, error: null };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  async getPendingFunerals(): Promise<{
    data: FuneralWithStats[];
    count: number;
    error: string | null;
  }> {
    try {
      const { data, error, count } = await this.supabase
        .from("funerals")
        .select("*, condolences(count), donations(amount)", { count: "exact" })
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: [], count: 0, error: error.message };
      }

      const funeralsWithStats: FuneralWithStats[] =
        data?.map(this.transformFuneralData) || [];

      return { data: funeralsWithStats, count: count || 0, error: null };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }

  async getAdminFunerals(): Promise<{
    data: FuneralWithStats[];
    count: number;
    error: string | null;
  }> {
    try {
      const { data, error, count } = await this.supabase
        .from("funerals")
        .select(`*, condolences(count), donations(amount)`, { count: "exact" })
        .order("created_at", { ascending: false });

      if (error) {
        return { data: [], count: 0, error: error.message };
      }

      const funeralsWithStats: FuneralWithStats[] =
        data?.map((f) => {
          const transformed = this.transformFuneralData(f);
          return {
            ...transformed,
            deceased: f.deceased_name,
            organizer: f.family_name ?? undefined,
            date: f.funeral_date ?? undefined,
            submittedAt: f.created_at ?? undefined,
          };
        }) || [];

      return { data: funeralsWithStats, count: count || 0, error: null };
    } catch (error) {
      return {
        data: [],
        count: 0,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  }
}

export const funeralsAPI = new FuneralsAPI();
