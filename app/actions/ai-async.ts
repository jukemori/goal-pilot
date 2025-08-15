'use server'

import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import {
  generateRoadmapOverviewPrompt,
  generateStagesPrompt,
  ROADMAP_SYSTEM_PROMPT,
  STAGES_SYSTEM_PROMPT,
} from '@/lib/ai/prompts'
import type { Json, Tables, TablesInsert, Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

type Goal = Tables<'goals'>
type RoadmapInsert = TablesInsert<'roadmaps'>
type ProgressStageInsert = TablesInsert<'progress_stages'>

// Interfaces for enhanced template data
interface EnhancedPhase {
  title: string
  weeks: number
  description: string
  skills_to_learn: string[]
  learning_objectives: string[]
  key_concepts: string[]
  daily_activities: string[]
  resources: string[]
  milestones?: string[]
}

interface EnhancedTemplate {
  overview: string
  approach: string
  total_estimated_hours: number
  difficulty_factors: string[]
  prerequisites: string[]
  phases: EnhancedPhase[]
  success_metrics: string[]
  common_challenges: string[]
}

// Old function removed - replaced with generateFromEnhancedTemplate

async function generateFromEnhancedTemplate(
  goal: Goal,
  template: EnhancedTemplate,
  supabase: SupabaseClient<Database>
) {
  const totalWeeks = template.phases.reduce((sum: number, phase: EnhancedPhase) => sum + phase.weeks, 0)
  
  const roadmapData = {
    overview: template.overview,
    approach: template.approach,
    total_estimated_hours: template.total_estimated_hours,
    difficulty_factors: template.difficulty_factors,
    prerequisites: template.prerequisites,
    phases_count: template.phases.length,
    estimated_duration_weeks: totalWeeks,
    phases: template.phases.map((phase: EnhancedPhase, index: number) => ({
      id: `phase-${index + 1}`,
      title: phase.title,
      description: phase.description,
      duration_weeks: phase.weeks,
      skills_to_learn: phase.skills_to_learn,
      learning_objectives: phase.learning_objectives,
      key_concepts: phase.key_concepts,
      daily_activities: phase.daily_activities,
      resources: phase.resources,
    })),
    milestones: template.phases.map((phase: EnhancedPhase, index: number) => ({
      week: template.phases.slice(0, index + 1).reduce((sum: number, p: EnhancedPhase) => sum + p.weeks, 0),
      title: `Complete ${phase.title}`,
      description: phase.milestones?.[0] || `Successfully finish all objectives in ${phase.title}`,
    })),
    success_metrics: template.success_metrics,
    common_challenges: template.common_challenges,
    generation_status: 'completed',
    template_used: true,
    personalized: true,
  }

  // Save roadmap
  const roadmapInsert: RoadmapInsert = {
    goal_id: goal.id,
    ai_generated_plan: roadmapData as unknown as Json,
    milestones: roadmapData.milestones as unknown as Json,
    ai_model: 'enhanced-template',
    prompt_version: 'v6-enhanced',
  }

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .insert(roadmapInsert)
    .select()
    .single()

  if (roadmap) {
    // Create detailed progress stages
    const stages: ProgressStageInsert[] = roadmapData.phases.map((phase: { id: string; title: string; description: string; duration_weeks: number; skills_to_learn: string[]; learning_objectives: string[]; key_concepts: string[]; daily_activities: string[]; resources: string[] }, index: number) => {
      const phaseStartDate = new Date(goal.start_date)
      const weeksBeforePhase = template.phases
        .slice(0, index)
        .reduce((sum: number, p: EnhancedPhase) => sum + p.weeks, 0)
      phaseStartDate.setDate(phaseStartDate.getDate() + weeksBeforePhase * 7)
      
      const phaseEndDate = new Date(phaseStartDate)
      phaseEndDate.setDate(phaseEndDate.getDate() + phase.duration_weeks * 7 - 1)

      return {
        roadmap_id: roadmap.id,
        phase_id: phase.id,
        phase_number: index + 1,
        title: phase.title,
        description: phase.description,
        duration_weeks: phase.duration_weeks,
        start_date: phaseStartDate.toISOString().split('T')[0],
        end_date: phaseEndDate.toISOString().split('T')[0],
        skills_to_learn: phase.skills_to_learn,
        learning_objectives: phase.learning_objectives,
        key_concepts: phase.key_concepts,
        resources: {
          daily_activities: phase.daily_activities,
          resources: phase.resources,
        } as unknown as Json,
      }
    })

    await supabase.from('progress_stages').insert(stages)
  }

  return roadmap
}

interface RoadmapOverview {
  milestones?: unknown
  [key: string]: unknown
}

interface AIPhase {
  id?: string
  title: string
  description?: string
  duration_weeks: number
  skills_to_learn?: string[]
  learning_objectives?: string[]
  key_concepts?: string[]
}

interface StagesData {
  phases: AIPhase[]
  [key: string]: unknown
}

// Optimized parallel generation with streaming
export async function generateRoadmapAsync(goalId: string) {
  const supabase = await createClient()

  // Get the goal details
  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .single()

  if (goalError || !goal) {
    throw new Error('Goal not found')
  }

  // First try enhanced template-based generation
  const { findEnhancedTemplate, personalizeTemplate } = await import('@/lib/ai/enhanced-templates')
  const baseTemplate = findEnhancedTemplate(goal.title)
  
  if (baseTemplate) {
    console.log('Using enhanced template for roadmap generation:', goal.title)
    
    // Personalize template based on user context
    const personalizedTemplate = personalizeTemplate(baseTemplate, {
      currentLevel: goal.current_level || 'beginner',
      timeCommitment: goal.daily_time_commitment || 30,
      targetDate: goal.target_date || undefined,
    })
    
    return await generateFromEnhancedTemplate(goal, personalizedTemplate, supabase)
  }

  // Step 1: Generate overview with reduced token count and simpler prompt
  const overviewPrompt = generateRoadmapOverviewPrompt(
    goal.title,
    goal.current_level || 'I am a complete beginner with no prior experience',
    goal.daily_time_commitment || 30,
    goal.target_date,
    goal.weekly_schedule as Record<string, boolean>,
    goal.start_date,
  )

  try {
    // Generate overview with optimized settings
    const overviewCompletion = await openai.chat.completions.create(
      {
        model: AI_MODELS.roadmap,
        messages: [
          {
            role: 'system',
            content: ROADMAP_SYSTEM_PROMPT,
          },
          { role: 'user', content: overviewPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7, // Higher temperature for more detailed output
        max_tokens: 4000, // Restored for quality
      },
      {
        timeout: 30000, // 30 seconds timeout (reduced from 120)
      },
    )

    const overviewContent = overviewCompletion.choices[0].message.content!
    const roadmapOverview = JSON.parse(overviewContent)

    // Save the roadmap overview immediately
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        goal_id: goalId,
        ai_generated_plan: {
          overview_generated: true,
          generation_status: 'generating_stages',
          ...roadmapOverview,
        } as unknown as Json,
        milestones: (roadmapOverview.milestones || []) as unknown as Json,
        ai_model: AI_MODELS.roadmap,
        prompt_version: 'v3-async',
      })
      .select()
      .single()

    if (roadmapError) {
      throw new Error('Failed to save roadmap overview')
    }

    // Step 2: Generate stages asynchronously
    generateStagesAsync(roadmap.id, goal, roadmapOverview).catch((error) => {
      console.error('Failed to generate stages:', error)
      // Update status to indicate failure
      supabase
        .from('roadmaps')
        .update({
          ai_generated_plan: {
            ...(roadmapOverview as object),
            generation_status: 'failed',
            error: error.message,
          } as unknown as Json,
        })
        .eq('id', roadmap.id)
        .then(() => {})
    })

    return roadmap
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate roadmap')
  }
}

async function generateStagesAsync(
  roadmapId: string,
  goal: Goal,
  roadmapOverview: RoadmapOverview,
): Promise<void> {
  const supabase = await createClient()

  const prompt = generateStagesPrompt(
    goal.title,
    goal.current_level || 'I am a complete beginner with no prior experience',
    roadmapOverview,
    goal.daily_time_commitment || 30,
    goal.weekly_schedule as Record<string, boolean>,
  )

  try {
    const completion = await openai.chat.completions.create(
      {
        model: AI_MODELS.stages,
        messages: [
          {
            role: 'system',
            content: STAGES_SYSTEM_PROMPT,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7, // Restored for quality
        max_tokens: 8000, // Restored for detailed output
      },
      {
        timeout: 30000, // 30 seconds timeout
      },
    )

    const content = completion.choices[0].message.content!
    const stagesData: StagesData = JSON.parse(content)

    // Validate stages
    if (!stagesData.phases || stagesData.phases.length < 3) {
      throw new Error('Incomplete stages response')
    }

    // Update the roadmap with complete data
    const completeRoadmapData = {
      ...(roadmapOverview as object),
      ...(stagesData as object),
      stages_generated: true,
      generation_status: 'completed',
    }

    await supabase
      .from('roadmaps')
      .update({
        ai_generated_plan: completeRoadmapData as unknown as Json,
        ai_model: `${AI_MODELS.roadmap}+${AI_MODELS.stages}`,
        prompt_version: 'v3-complete',
      })
      .eq('id', roadmapId)

    // Create progress stages records
    const stages: ProgressStageInsert[] = stagesData.phases.map((phase, index) => ({
      roadmap_id: roadmapId,
      phase_id: phase.id || `phase-${index + 1}`,
      phase_number: index + 1,
      title: phase.title,
      description: phase.description || '',
      duration_weeks: phase.duration_weeks || 1,
      start_date: calculatePhaseStartDate(
        goal.start_date,
        index,
        stagesData.phases,
      ),
      end_date: calculatePhaseEndDate(
        goal.start_date,
        index,
        stagesData.phases,
      ),
    }))

    await supabase.from('progress_stages').insert(stages)
  } catch (error) {
    console.error('Stage generation failed:', error)
    throw error
  }
}

function calculatePhaseStartDate(
  goalStartDate: string,
  phaseIndex: number,
  phases: AIPhase[],
): string {
  const startDate = new Date(goalStartDate)
  let totalWeeks = 0

  for (let i = 0; i < phaseIndex; i++) {
    totalWeeks += phases[i].duration_weeks || 1
  }

  startDate.setDate(startDate.getDate() + totalWeeks * 7)
  return startDate.toISOString().split('T')[0]
}

function calculatePhaseEndDate(
  goalStartDate: string,
  phaseIndex: number,
  phases: AIPhase[],
): string {
  const startDate = new Date(goalStartDate)
  let totalWeeks = 0

  for (let i = 0; i <= phaseIndex; i++) {
    totalWeeks += phases[i].duration_weeks || 1
  }

  startDate.setDate(startDate.getDate() + totalWeeks * 7 - 1)
  return startDate.toISOString().split('T')[0]
}