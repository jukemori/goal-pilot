import { Database, Tables } from './database'

// Re-export generated database types
export type Goal = Tables<'goals'>
export type User = Tables<'users'>
export type Task = Tables<'tasks'>
export type Roadmap = Tables<'roadmaps'>
export type LearningPhase = Tables<'learning_phases'>

// Weekly schedule type extracted from Goal type
export type WeeklySchedule = NonNullable<Goal['weekly_schedule']>

// AI-related types that don't directly map to database tables
export interface RoadmapPlan {
  overview: string
  phases: Phase[]
  estimated_completion_date: string
  total_hours_required: number
}

export interface Phase {
  id: string
  title: string
  description: string
  duration_weeks: number
  skills_to_learn: string[]
  tasks: string[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  target_date: string
  completed: boolean
  completed_date: string | null
}

// Export database types for direct usage
export type { Database, Tables } from './database'
export type { TablesInsert, TablesUpdate, Enums, CompositeTypes } from './database'