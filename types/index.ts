export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  start_date: string
  target_date: string | null
  daily_time_commitment: number
  weekly_schedule: WeeklySchedule
  status: 'active' | 'completed' | 'paused'
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface WeeklySchedule {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface Roadmap {
  id: string
  goal_id: string
  ai_generated_plan: RoadmapPlan
  milestones: Milestone[]
  ai_model: string
  prompt_version: string
  created_at: string
  updated_at: string
}

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

export interface Task {
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

export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  created_at: string
  updated_at: string
}