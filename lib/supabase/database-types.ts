export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          start_date: string
          target_date: string | null
          daily_time_commitment: number
          weekly_schedule: Json
          status: 'active' | 'completed' | 'paused'
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          start_date: string
          target_date?: string | null
          daily_time_commitment: number
          weekly_schedule: Json
          status?: 'active' | 'completed' | 'paused'
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          current_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          start_date?: string
          target_date?: string | null
          daily_time_commitment?: number
          weekly_schedule?: Json
          status?: 'active' | 'completed' | 'paused'
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      roadmaps: {
        Row: {
          id: string
          goal_id: string
          ai_generated_plan: Json
          milestones: Json
          ai_model: string
          prompt_version: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          ai_generated_plan: Json
          milestones?: Json
          ai_model?: string
          prompt_version?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          ai_generated_plan?: Json
          milestones?: Json
          ai_model?: string
          prompt_version?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string | null
          scheduled_date: string
          estimated_duration: number
          actual_duration: number | null
          priority: number
          completed: boolean
          completed_at: string | null
          rescheduled_count: number
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description?: string | null
          scheduled_date: string
          estimated_duration: number
          actual_duration?: number | null
          priority?: number
          completed?: boolean
          completed_at?: string | null
          rescheduled_count?: number
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string | null
          scheduled_date?: string
          estimated_duration?: number
          actual_duration?: number | null
          priority?: number
          completed?: boolean
          completed_at?: string | null
          rescheduled_count?: number
          tags?: string[] | null
          created_at?: string
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
      [_ in never]: never
    }
  }
}