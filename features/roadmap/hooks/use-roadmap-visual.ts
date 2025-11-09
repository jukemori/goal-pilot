'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Target, Zap, Award, LucideIcon } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

interface RoadmapPhase {
  id: string
  name: string
  iconComponent: LucideIcon
  description: string
  duration: number
  key_activities: string[]
  success_metrics: string[]
}

export interface RoadmapVisualData {
  roadmapPhases: RoadmapPhase[]
  goal: {
    title: string
    description: string | null
    target_date: string | null
    daily_time_commitment: number | null
  }
  overview: string
  totalHours: number
  completionDate: string
}

// Generate AI-powered phase name based on grouped stages
const generateAIPhaseName = (
  stages: Array<{ title: string }>,
  phaseIndex: number,
) => {
  // Use the first stage title as the primary theme for this phase
  const primaryStage = stages[0]?.title || `Learning Phase ${phaseIndex + 1}`

  // Extract the core concept from the stage title to create a meaningful phase name
  // Remove common stage prefixes/suffixes to get the core concept
  const coreTheme = primaryStage
    .replace(
      /^(Learn|Master|Build|Develop|Practice|Study|Understand|Explore)\s+/i,
      '',
    )
    .replace(/\s+(Basics?|Fundamentals?|Foundation|Skills?|Techniques?)$/i, '')
    .trim()

  // If we have multiple stages, create a comprehensive phase name
  if (stages.length > 1) {
    return `${coreTheme} & Progressive Skills`
  }

  return coreTheme || `Learning Phase ${phaseIndex + 1}`
}

// Create phase description
const createPhaseDescription = (phaseName: string, goalTitle: string) => {
  const name = phaseName.toLowerCase()
  const goal = goalTitle.toLowerCase()

  if (name.includes('foundation') || name.includes('basic')) {
    return `Build essential ${goal} fundamentals and establish consistent practice habits`
  } else if (
    name.includes('develop') ||
    name.includes('build') ||
    name.includes('core')
  ) {
    return `Develop practical ${goal} skills through focused practice and application`
  } else if (name.includes('advanced') || name.includes('complex')) {
    return `Master advanced ${goal} techniques and tackle challenging scenarios`
  } else if (
    name.includes('mastery') ||
    name.includes('achieve') ||
    name.includes('peak')
  ) {
    return `Achieve ${goal} mastery and maintain excellence in your practice`
  } else {
    return `Continue progressing in your ${goal} journey with focused practice`
  }
}

export function useRoadmapVisual(roadmapId: string) {
  const supabase = createClient()

  return useQuery<RoadmapVisualData>({
    queryKey: ['roadmap-visual', roadmapId],
    queryFn: async () => {
      logger.debug('Fetching roadmap for visual view', { roadmapId })

      // Get roadmap with AI plan and goal details
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .select(
          `
          ai_generated_plan,
          milestones,
          goals!inner (
            title,
            description,
            target_date,
            daily_time_commitment
          )
        `,
        )
        .eq('id', roadmapId)
        .single()

      if (roadmapError) {
        logger.error('Failed to fetch roadmap', { error: roadmapError, roadmapId })
        throw roadmapError
      }

      if (!roadmap?.ai_generated_plan) {
        return {
          roadmapPhases: [],
          milestones: [],
          goal: roadmap.goals,
          overview: '',
          totalHours: 0,
          completionDate: '',
        } as RoadmapVisualData
      }

      const aiPlan = roadmap.ai_generated_plan as {
        overview: string
        phases: Array<{
          title: string
          description: string
          duration_weeks?: number
          skills_to_learn?: string[]
          learning_objectives?: string[]
          outcomes?: string[]
        }>
        roadmap_phases?: Array<{
          id: string
          name: string
          description: string
          duration_percentage: number
          key_activities: string[]
          specific_goals: string[]
          success_metrics: string[]
          tools_needed: string[]
        }>
        total_hours_required: number
        estimated_completion_date: string
      }

      // Generate roadmap phases from actual AI stages data

      // Create 4 high-level roadmap phases by grouping the detailed stages
      const roadmapPhases: RoadmapPhase[] = []
      const stagesPerPhase = Math.ceil(aiPlan.phases.length / 4)

      for (let i = 0; i < 4; i++) {
        const startIdx = i * stagesPerPhase
        const endIdx = Math.min(startIdx + stagesPerPhase, aiPlan.phases.length)
        const phaseStages = aiPlan.phases.slice(startIdx, endIdx)

        if (phaseStages.length === 0) break

        // Calculate duration for this roadmap phase
        const phaseDuration = phaseStages.reduce(
          (sum, stage) => sum + (stage.duration_weeks || 0),
          0,
        )

        // Generate AI-powered phase name based on actual stage content
        let phaseIconComponent: LucideIcon = BookOpen // Default icon

        // Use AI-generated stage titles to create meaningful phase names
        const phaseName = generateAIPhaseName(phaseStages, i)

        // Set appropriate icon based on phase position
        if (i === 0) {
          phaseIconComponent = BookOpen
        } else if (i === 3 || i === Math.floor(4 * 0.75)) {
          phaseIconComponent = Award
        } else if (i === 1) {
          phaseIconComponent = Zap
        } else {
          phaseIconComponent = Target
        }

        // Extract key activities from stages
        const keyActivities: string[] = []
        phaseStages.forEach((stage) => {
          if (stage.skills_to_learn && stage.skills_to_learn.length > 0) {
            keyActivities.push(...stage.skills_to_learn.slice(0, 1))
          }
        })

        // Extract success metrics from stages
        const successMetrics: string[] = []
        phaseStages.forEach((stage) => {
          if (stage.outcomes && stage.outcomes.length > 0) {
            successMetrics.push(...stage.outcomes.slice(0, 1))
          }
        })

        roadmapPhases.push({
          id: `roadmap-${i + 1}`,
          name: phaseName,
          iconComponent: phaseIconComponent,
          description: createPhaseDescription(phaseName, roadmap.goals.title),
          duration: phaseDuration,
          key_activities: keyActivities.slice(0, 2), // Max 2 activities
          success_metrics: successMetrics.slice(0, 1), // Max 1 success metric
        })
      }

      return {
        roadmapPhases,
        goal: roadmap.goals,
        overview: aiPlan.overview,
        totalHours: aiPlan.total_hours_required,
        completionDate: aiPlan.estimated_completion_date,
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
