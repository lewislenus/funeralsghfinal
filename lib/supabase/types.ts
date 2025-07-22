export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: "user" | "organizer" | "admin"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: "user" | "organizer" | "admin"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: "user" | "organizer" | "admin"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      funerals: {
        Row: {
          id: string
          user_id: string
          deceased_name: string
          date_of_birth: string
          date_of_death: string
          funeral_date: string
          funeral_location: string
          life_story: string | null
          image_url: string | null
          organized_by: string | null
          livestream_url: string | null
          brochure_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organizer_id: string
          deceased_name: string
          deceased_photo_url?: string | null
          date_of_birth: string
          date_of_death: string
          biography?: string | null
          funeral_date: string
          funeral_time: string
          venue: string
          region: string
          location: string
          coordinates?: Json | null
          family_name: string
          family_contact?: string | null
          family_details?: string | null
          poster_url?: string | null
          brochure_url?: string | null
          livestream_url?: string | null
          gallery_urls?: string[] | null
          status?: "draft" | "pending" | "approved" | "rejected" | "completed"
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organizer_id?: string
          deceased_name?: string
          deceased_photo_url?: string | null
          date_of_birth?: string
          date_of_death?: string
          biography?: string | null
          funeral_date?: string
          funeral_time?: string
          venue?: string
          region?: string
          location?: string
          coordinates?: Json | null
          family_name?: string
          family_contact?: string | null
          family_details?: string | null
          poster_url?: string | null
          brochure_url?: string | null
          livestream_url?: string | null
          gallery_urls?: string[] | null
          status?: "draft" | "pending" | "approved" | "rejected" | "completed"
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      condolences: {
        Row: {
          id: string
          funeral_id: string
          author_name: string
          author_email: string | null
          author_location: string | null
          message: string
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          funeral_id: string
          author_name: string
          author_email?: string | null
          author_location?: string | null
          message: string
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          funeral_id?: string
          author_name?: string
          author_email?: string | null
          author_location?: string | null
          message?: string
          is_approved?: boolean
          created_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          funeral_id: string
          donor_name: string | null
          donor_email: string | null
          amount: number
          currency: string
          message: string | null
          payment_method: string | null
          payment_reference: string | null
          status: "pending" | "completed" | "failed" | "refunded"
          created_at: string
        }
        Insert: {
          id?: string
          funeral_id: string
          donor_name?: string | null
          donor_email?: string | null
          amount: number
          currency?: string
          message?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: "pending" | "completed" | "failed" | "refunded"
          created_at?: string
        }
        Update: {
          id?: string
          funeral_id?: string
          donor_name?: string | null
          donor_email?: string | null
          amount?: number
          currency?: string
          message?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: "pending" | "completed" | "failed" | "refunded"
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string | null
          action_type: string
          target_type: string
          target_id: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action_type: string
          target_type: string
          target_id: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action_type?: string
          target_type?: string
          target_id?: string
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_funeral_views: {
        Args: {
          funeral_uuid: string
        }
        Returns: undefined
      }
      get_funeral_stats: {
        Args: {
          funeral_uuid: string
        }
        Returns: {
          condolences_count: number
          donations_total: number
          donations_count: number
          views_count: number
        }[]
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          total_funerals: number
          pending_funerals: number
          flagged_content: number
          total_donations: number
          monthly_growth: number
        }[]
      }
    }
    Enums: {
      funeral_status: "draft" | "pending" | "approved" | "rejected" | "completed"
      user_role: "user" | "organizer" | "admin"
      donation_status: "pending" | "completed" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
