'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { goalFormSchema } from '@/lib/validations/goal'
import { ensureUserProfile } from './auth'
import { findMatchingTemplate } from '@/lib/ai/template-cache'
import { Json, TablesInsert } from '@/types/database'

type RoadmapInsert = TablesInsert<'roadmaps'>
type ProgressStageInsert = TablesInsert<'progress_stages'>

export async function createGoalOptimized(formData: FormData) {
  const supabase = await createClient()

  // Ensure user profile exists and get user
  const user = await ensureUserProfile()

  // Parse and validate form data
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    current_level: formData.get('current_level') as string,
    start_date: formData.get('start_date') as string,
    target_date: formData.get('target_date') as string,
    daily_time_commitment: parseInt(
      formData.get('daily_time_commitment') as string,
    ),
    weekly_schedule: JSON.parse(formData.get('weekly_schedule') as string),
  }

  const validatedData = goalFormSchema.parse(rawData)

  // Handle empty target_date
  const goalData = {
    ...validatedData,
    target_date:
      validatedData.target_date && validatedData.target_date.trim() !== ''
        ? validatedData.target_date
        : null,
  }

  // Create the goal
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      ...goalData,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Supabase error creating goal:', error)
    throw new Error(`Failed to create goal: ${error.message}`)
  }

  // Try instant generation with templates first
  const template = findMatchingTemplate(goal.title)
  
  if (template) {
    // Instant generation with template
    try {
      const totalWeeks = template.phases.reduce((sum, phase) => sum + phase.weeks, 0)
      
      const roadmapData = {
        overview: template.overview,
        approach: template.approach,
        phases_count: template.phases.length,
        estimated_duration_weeks: totalWeeks,
        phases: template.phases.map((phase, index) => ({
          id: `phase-${index + 1}`,
          title: phase.title,
          description: phase.focus,
          duration_weeks: phase.weeks,
          skills_to_learn: phase.focus.split(', ').slice(0, 3),
          key_concepts: phase.focus.split(', '),
        })),
        milestones: [
          {
            week: Math.floor(totalWeeks / 3),
            title: 'Initial Progress',
            description: 'Complete foundational learning',
          },
          {
            week: Math.floor((totalWeeks * 2) / 3),
            title: 'Intermediate Milestone',
            description: 'Apply skills in practice',
          },
          {
            week: totalWeeks,
            title: 'Goal Achievement',
            description: 'Reach target proficiency',
          },
        ],
        generation_status: 'completed',
        template_used: true,
      }

      // Save roadmap instantly
      const roadmapInsert: RoadmapInsert = {
        goal_id: goal.id,
        ai_generated_plan: roadmapData as unknown as Json,
        milestones: roadmapData.milestones as unknown as Json,
        ai_model: 'template',
        prompt_version: 'v5-instant',
      }

      const { data: roadmap } = await supabase
        .from('roadmaps')
        .insert(roadmapInsert)
        .select('*')
        .single()

      if (roadmap) {
        // Create progress stages
        const stages: ProgressStageInsert[] = roadmapData.phases.map((phase, index) => {
          const phaseStartDate = new Date(goal.start_date)
          const weeksBeforePhase = template.phases
            .slice(0, index)
            .reduce((sum, p) => sum + p.weeks, 0)
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
          }
        })

        await supabase.from('progress_stages').insert(stages)
        
        revalidatePath('/dashboard')
        return { success: true, goalId: goal.id, instant: true }
      }
    } catch (error) {
      console.error('Template generation failed, falling back to AI:', error)
    }
  }

  // Fall back to async AI generation
  const { generateRoadmapAsync } = await import('./ai-async')
  generateRoadmapAsync(goal.id).catch((error) => {
    console.error('Background roadmap generation failed:', error)
  })

  revalidatePath('/dashboard')
  return { success: true, goalId: goal.id, instant: false }
}