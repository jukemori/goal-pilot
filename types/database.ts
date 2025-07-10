export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      goals: {
        Row: {
          created_at: string | null
          current_level: string | null
          daily_time_commitment: number | null
          description: string | null
          id: string
          start_date: string
          status: string | null
          tags: string[] | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          weekly_schedule: Json | null
        }
        Insert: {
          created_at?: string | null
          current_level?: string | null
          daily_time_commitment?: number | null
          description?: string | null
          id?: string
          start_date: string
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          weekly_schedule?: Json | null
        }
        Update: {
          created_at?: string | null
          current_level?: string | null
          daily_time_commitment?: number | null
          description?: string | null
          id?: string
          start_date?: string
          status?: string | null
          tags?: string[] | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          weekly_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_phases: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          end_date: string | null
          id: string
          key_concepts: string[] | null
          learning_objectives: string[] | null
          outcomes: string[] | null
          phase_id: string
          phase_number: number
          prerequisites: string[] | null
          resources: Json | null
          roadmap_id: string | null
          skills_to_learn: string[] | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          id?: string
          key_concepts?: string[] | null
          learning_objectives?: string[] | null
          outcomes?: string[] | null
          phase_id: string
          phase_number: number
          prerequisites?: string[] | null
          resources?: Json | null
          roadmap_id?: string | null
          skills_to_learn?: string[] | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          end_date?: string | null
          id?: string
          key_concepts?: string[] | null
          learning_objectives?: string[] | null
          outcomes?: string[] | null
          phase_id?: string
          phase_number?: number
          prerequisites?: string[] | null
          resources?: Json | null
          roadmap_id?: string | null
          skills_to_learn?: string[] | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_phases_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          ai_generated_plan: Json | null
          ai_model: string | null
          created_at: string | null
          goal_id: string | null
          id: string
          milestones: Json | null
          prompt_version: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated_plan?: Json | null
          ai_model?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          milestones?: Json | null
          prompt_version?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated_plan?: Json | null
          ai_model?: string | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          milestones?: Json | null
          prompt_version?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_duration: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          phase_id: string | null
          phase_number: number | null
          priority: number | null
          rescheduled_count: number | null
          roadmap_id: string | null
          scheduled_date: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          phase_id?: string | null
          phase_number?: number | null
          priority?: number | null
          rescheduled_count?: number | null
          roadmap_id?: string | null
          scheduled_date: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          phase_id?: string | null
          phase_number?: number | null
          priority?: number | null
          rescheduled_count?: number | null
          roadmap_id?: string | null
          scheduled_date?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          daily_reminders: boolean | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          start_of_week: string | null
          updated_at: string | null
          user_id: string
          weekly_reports: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_reminders?: boolean | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          start_of_week?: string | null
          updated_at?: string | null
          user_id: string
          weekly_reports?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_reminders?: boolean | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          start_of_week?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_reports?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Additional type definitions for the application
export interface Milestone {
  id: string
  title: string
  description: string
  target_date: string
  stage_number: number
  skills_validated: string[]
  icon: 'foundation' | 'target' | 'trophy' | 'star' | 'flag'
  color: 'blue' | 'green' | 'gold' | 'purple' | 'red'
}

// Type aliases for cleaner usage
export type Goal = Tables<'goals'>
export type Task = Tables<'tasks'>
export type LearningPhase = Tables<'learning_phases'>
export type Roadmap = Tables<'roadmaps'>
export type User = Tables<'users'>
export type UserPreferences = Tables<'user_preferences'>