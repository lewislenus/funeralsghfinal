import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Condolence = Database["public"]["Tables"]["condolences"]["Row"]
type CondolenceInsert = Database["public"]["Tables"]["condolences"]["Insert"]

export class CondolencesAPI {
  private supabase = createClient()

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

  async getCondolences(funeralId: string): Promise<{
    data: Condolence[]
    error: string | null
  }> {
    try {
      this.checkEnvironment();
      
      const { data, error } = await this.supabase
        .from("condolences")
        .select("*")
        .eq("funeral_id", funeralId)
        .eq("is_approved", true)
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

  async createCondolence(condolence: CondolenceInsert): Promise<{
    data: Condolence | null
    error: string | null
  }> {
    try {
      this.checkEnvironment();
      
      const { data, error } = await this.supabase
        .from("condolences")
        .insert({
          ...condolence,
          is_approved: false, // Require approval by default
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

  async approveCondolence(id: string): Promise<{ error: string | null }> {
    try {
      this.checkEnvironment();
      
      const { error } = await this.supabase.from("condolences").update({ is_approved: true }).eq("id", id)

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

  async deleteCondolence(id: string): Promise<{ error: string | null }> {
    try {
      this.checkEnvironment();
      
      const { error } = await this.supabase.from("condolences").delete().eq("id", id)

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
}

export const condolencesAPI = new CondolencesAPI()
