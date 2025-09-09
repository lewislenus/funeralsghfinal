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
          id: number
          created_at: string | null
          user_id: string | null
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
          view_count: number | null
        }
        Insert: {
          id?: never
          created_at?: string | null
          user_id?: string | null
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
          view_count?: number | null
        }
        Update: {
          id?: never
          created_at?: string | null
          user_id?: string | null
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
          view_count?: number | null
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
          id: number
          created_at: string
          funeral_id: number
          author_name: string | null
          message: string | null
          is_approved: boolean | null
        }
        Insert: {
          id?: number
          created_at?: string
          funeral_id: number
          author_name?: string | null
          message?: string | null
          is_approved?: boolean | null
        }
        Update: {
          id?: number
          created_at?: string
          funeral_id?: number
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
          id: number
          created_at: string
          funeral_id: number
          amount: number
        }
        Insert: {
          id?: number
          created_at?: string
          funeral_id: number
          amount: number
        }
        Update: {
          id?: number
          created_at?: string
          funeral_id?: number
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
          funeral_id_param: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
