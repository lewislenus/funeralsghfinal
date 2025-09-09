export type Json = 
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      funerals: {
        Row: {
          id: string
          created_at: string | null
          user_id: string | null
          organizer_id: string | null
          deceased_name: string
          date_of_birth: string | null
          date_of_death: string | null
          funeral_date: string | null
          funeral_time: string | null
          funeral_location: string | null
          venue: string | null
          region: string | null
          location: string | null
          family_name: string | null
          family_contact: string | null
          poster_url: string | null
          gallery_urls: string[] | null
          life_story: string | null
          image_url: string | null
          is_public: boolean | null
          organized_by: string | null
          livestream_url: string | null
          brochure_url: string | null
          status: string | null
          featured: boolean | null
          views_count: number | null
          deceased_photo_url: string | null
          biography: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          organizer_id?: string | null
          deceased_name: string
          date_of_birth?: string | null
          date_of_death?: string | null
          funeral_date?: string | null
          funeral_time?: string | null
          funeral_location?: string | null
          venue?: string | null
          region?: string | null
          location?: string | null
          family_name?: string | null
          family_contact?: string | null
          poster_url?: string | null
          gallery_urls?: string[] | null
          life_story?: string | null
          image_url?: string | null
          is_public?: boolean | null
          organized_by?: string | null
          livestream_url?: string | null
          brochure_url?: string | null
          status?: string | null
          featured?: boolean | null
          views_count?: number | null
          deceased_photo_url?: string | null
          biography?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          user_id?: string | null
          organizer_id?: string | null
          deceased_name?: string
          date_of_birth?: string | null
          date_of_death?: string | null
          funeral_date?: string | null
          funeral_time?: string | null
          funeral_location?: string | null
          venue?: string | null
          region?: string | null
          location?: string | null
          family_name?: string | null
          family_contact?: string | null
          poster_url?: string | null
          gallery_urls?: string[] | null
          life_story?: string | null
          image_url?: string | null
          is_public?: boolean | null
          organized_by?: string | null
          livestream_url?: string | null
          brochure_url?: string | null
          status?: string | null
          featured?: boolean | null
          views_count?: number | null
          deceased_photo_url?: string | null
          biography?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funerals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      condolences: {
        Row: {
          id: string
          created_at: string
          funeral_id: string
          author_name: string | null
          message: string | null
          is_approved: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          funeral_id: string
          author_name?: string | null
          message?: string | null
          is_approved?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          funeral_id?: string
          author_name?: string | null
          message?: string | null
          is_approved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "condolences_funeral_id_fkey"
            columns: ["funeral_id"]
            isOneToOne: false
            referencedRelation: "funerals"
            referencedColumns: ["id"]
          }
        ]
      }
      donations: {
        Row: {
          id: string
          created_at: string
          funeral_id: string
          amount: number
        }
        Insert: {
          id?: string
          created_at?: string
          funeral_id: string
          amount: number
        }
        Update: {
          id?: string
          created_at?: string
          funeral_id?: string
          amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "donations_funeral_id_fkey"
            columns: ["funeral_id"]
            isOneToOne: false
            referencedRelation: "funerals"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
      funeral_stats: {
        condolences_count: number
        donations_total: number
        donations_count: number
        views_count: number
      }
      admin_stats: {
        total_users: number
        total_funerals: number
        pending_funerals: number
        flagged_content: number
        total_donations: number
        monthly_growth: number
      }
    }
  }
}
