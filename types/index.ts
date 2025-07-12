// Re-export all generated database types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  Json,
  Goal,
  User,
  Task,
  Roadmap,
  ProgressStage,
  UserPreferences,
  Milestone,
} from "./database";

// Weekly schedule type extracted from Goal type
export type WeeklySchedule = Record<string, boolean>;

// AI-related types that don't directly map to database tables
export interface RoadmapPlan {
  overview: string;
  phases: Phase[];
  estimated_completion_date: string;
  total_hours_required: number;
  milestones: import("./database").Milestone[];
  roadmap_phases: RoadmapPhase[];
}

export interface RoadmapPhase {
  id: string;
  name: string;
  description: string;
  duration_percentage: number;
  key_activities: string[];
  specific_goals: string[];
  success_metrics: string[];
  tools_needed: string[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  skills_to_learn: string[];
  learning_objectives: string[];
  key_concepts: string[];
  prerequisites: string[];
  outcomes: string[];
  resources: string[];
}
