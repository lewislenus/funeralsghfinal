import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Funeral = Database["public"]["Tables"]["funerals"]["Row"]
type FuneralInsert = Database["public"]["Tables"]["funerals"]["Insert"]
type FuneralUpdate = Database["public"]["Tables"]["funerals"]["Update"]

export interface FuneralWithStats extends Funeral {
  condolences_count: number
  donations_total: number
  donations_count: number
}

export interface FuneralFilters {
  search?: string
  region?: string
  status?: "upcoming" | "past" | "all"
  dateRange?: "week" | "month" | "all"
  sortBy?: "date" | "name" | "recent" | "popular"
  limit?: number
  offset?: number
}

export class FuneralsAPI {
  private supabase = createClient()

  async getFunerals(filters: FuneralFilters = {}): Promise<{
    data: FuneralWithStats[]
    count: number
    error: string | null
  }> {
    try {
      let query = this.supabase
        .from("funerals")
        .select(`
          *,
          condolences!inner(count),
          donations!inner(amount, status)
        `)
        .eq("status", "approved")

      // Apply search filter
      if (filters.search) {
        query = query.or(`
          deceased_name.ilike.%${filters.search}%,
          family_name.ilike.%${filters.search}%,
          location.ilike.%${filters.search}%,
          venue.ilike.%${filters.search}%
        `)
      }

      // Apply region filter
      if (filters.region && filters.region !== "all") {
        query = query.eq("region", filters.region)
      }

      // Apply status filter (upcoming/past)
      if (filters.status === "upcoming") {
        query = query.gte("funeral_date", new Date().toISOString().split("T")[0])
      } else if (filters.status === "past") {
        query = query.lt("funeral_date", new Date().toISOString().split("T")[0])
      }

      // Apply date range filter
      if (filters.dateRange === "week") {
        const oneWeekFromNow = new Date()
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)
        query = query.lte("funeral_date", oneWeekFromNow.toISOString().split("T")[0])
      } else if (filters.dateRange === "month") {
        const oneMonthFromNow = new Date()
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
        query = query.lte("funeral_date", oneMonthFromNow.toISOString().split("T")[0])
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "date":
          query = query.order("funeral_date", { ascending: true })
          break
        case "name":
          query = query.order("deceased_name", { ascending: true })
          break
        case "recent":
          query = query.order("created_at", { ascending: false })
          break
        case "popular":
          query = query.order("views_count", { ascending: false })
          break
        default:
          query = query.order("funeral_date", { ascending: true })
      }

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data: funerals, error, count } = await query

      if (error) {
        return { data: [], count: 0, error: error.message }
      }

      // Transform data to include calculated stats
      const funeralsWithStats: FuneralWithStats[] =
        funerals?.map((funeral) => {
          const condolencesCount = funeral.condolences?.length || 0
          const completedDonations = funeral.donations?.filter((d) => d.status === "completed") || []
          const donationsTotal = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

          return {
            ...funeral,
            condolences_count: condolencesCount,
            donations_total: donationsTotal,
            donations_count: completedDonations.length,
          }
        }) || []

      return { data: funeralsWithStats, count: count || 0, error: null }
    } catch (error) {
      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async getFuneral(id: string): Promise<{
    data: FuneralWithStats | null
    error: string | null
  }> {
    try {
      const { data: funeral, error } = await this.supabase
        .from("funerals")
        .select(`
          *,
          condolences(
            id, author_name, author_location, message, created_at
          ),
          donations(
            id, donor_name, amount, message, created_at, status
          )
        `)
        .eq("id", id)
        .eq("status", "approved")
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      if (!funeral) {
        return { data: null, error: "Funeral not found" }
      }

      // Increment view count
      await this.incrementViews(id)

      // Calculate stats
      const approvedCondolences = funeral.condolences?.filter((c) => c.is_approved) || []
      const completedDonations = funeral.donations?.filter((d) => d.status === "completed") || []
      const donationsTotal = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

      const funeralWithStats: FuneralWithStats = {
        ...funeral,
        condolences_count: approvedCondolences.length,
        donations_total: donationsTotal,
        donations_count: completedDonations.length,
      }

      return { data: funeralWithStats, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async createFuneral(funeral: FuneralInsert): Promise<{
    data: Funeral | null
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase.from("funerals").insert(funeral).select().single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async updateFuneral(
    id: string,
    updates: FuneralUpdate,
  ): Promise<{
    data: Funeral | null
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase.from("funerals").update(updates).eq("id", id).select().single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async deleteFuneral(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.from("funerals").delete().eq("id", id)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  private async incrementViews(id: string): Promise<void> {
    try {
      await this.supabase.rpc("increment_funeral_views", { funeral_uuid: id })
    } catch (error) {
      // Silently fail view increment to not affect user experience
      console.error("Failed to increment views:", error)
    }
  }

  async getFeaturedFunerals(limit = 6): Promise<{
    data: FuneralWithStats[]
    error: string | null
  }> {
    try {
      const { data: funerals, error } = await this.supabase
        .from("funerals")
        .select(`
          *,
          condolences!inner(count),
          donations!inner(amount, status)
        `)
        .eq("status", "approved")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        return { data: [], error: error.message }
      }

      // Transform data to include calculated stats
      const funeralsWithStats: FuneralWithStats[] =
        funerals?.map((funeral) => {
          const condolencesCount = funeral.condolences?.length || 0
          const completedDonations = funeral.donations?.filter((d) => d.status === "completed") || []
          const donationsTotal = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

          return {
            ...funeral,
            condolences_count: condolencesCount,
            donations_total: donationsTotal,
            donations_count: completedDonations.length,
          }
        }) || []

      return { data: funeralsWithStats, error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }
}

export const funeralsAPI = new FuneralsAPI()
