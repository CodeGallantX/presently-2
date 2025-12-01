export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN' | 'CLASS_REP'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          avatar_url: string | null
          onboarding_complete: boolean
          phone_number: string | null
          matric_number: string | null
          department: string | null
          level: string | null
          staff_id: string | null
          courses: string | null
          assigned_lecturer: string | null
          notifications_enabled: boolean
          location_enabled: boolean
          dark_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: UserRole
          avatar_url?: string | null
          onboarding_complete?: boolean
          phone_number?: string | null
          matric_number?: string | null
          department?: string | null
          level?: string | null
          staff_id?: string | null
          courses?: string | null
          assigned_lecturer?: string | null
          notifications_enabled?: boolean
          location_enabled?: boolean
          dark_mode?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          onboarding_complete?: boolean
          phone_number?: string | null
          matric_number?: string | null
          department?: string | null
          level?: string | null
          staff_id?: string | null
          courses?: string | null
          assigned_lecturer?: string | null
          notifications_enabled?: boolean
          location_enabled?: boolean
          dark_mode?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
    }
  }
}
