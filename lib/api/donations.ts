import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Donation = Database["public"]["Tables"]["donations"]["Row"]
type DonationInsert = Database["public"]["Tables"]["donations"]["Insert"]

export class DonationsAPI {
  private supabase = createClient()

  async getDonations(funeralId: string): Promise<{
    data: Donation[]
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase
        .from("donations")
        .select("*")
        .eq("funeral_id", funeralId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  async createDonation(donation: DonationInsert): Promise<{
    data: Donation | null
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase
        .from("donations")
        .insert({
          ...donation,
          status: "pending", // Start as pending until payment is confirmed
        })
        .select()
        .single()

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

  async updateDonationStatus(
    id: string,
    status: "completed" | "failed" | "refunded",
    paymentReference?: string,
  ): Promise<{
    error: string | null
  }> {
    try {
      const updateData: any = { status }
      if (paymentReference) {
        updateData.payment_reference = paymentReference
      }

      const { error } = await this.supabase.from("donations").update(updateData).eq("id", id)

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

  async getDonationStats(funeralId: string): Promise<{
    data: {
      total: number
      count: number
      recent: Donation[]
    }
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase
        .from("donations")
        .select("*")
        .eq("funeral_id", funeralId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })

      if (error) {
        return {
          data: { total: 0, count: 0, recent: [] },
          error: error.message,
        }
      }

      const donations = data || []
      const total = donations.reduce((sum, donation) => sum + donation.amount, 0)
      const recent = donations.slice(0, 5) // Get 5 most recent

      return {
        data: {
          total,
          count: donations.length,
          recent,
        },
        error: null,
      }
    } catch (error) {
      return {
        data: { total: 0, count: 0, recent: [] },
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }
}

export const donationsAPI = new DonationsAPI()
