import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findMatchingTemplate } from '@/lib/ai/template-cache'
import { Json } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { goalId } = await request.json()

    const supabase = await createClient()

    // Get user and goal
    const [userResult, goalResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('goals').select('*').eq('id', goalId).single(),
    ])

    const {
      data: { user },
    } = userResult
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: goal, error: goalError } = goalResult
    if (goalError || !goal || goal.user_id !== user.id) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if we have a template match
    const template = findMatchingTemplate(goal.title)
    
    if (template) {
      // Use template for instant generation
      console.log('Using template for instant generation:', goal.title)
      
      // Calculate total weeks and duration
      const totalWeeks = template.phases.reduce((sum, phase) => sum + phase.weeks, 0)
      const endDate = new Date(goal.start_date)
      endDate.setDate(endDate.getDate() + totalWeeks * 7)
      
      // Create roadmap with template data
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

      // Save roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from('roadmaps')
        .insert({
          goal_id: goalId,
          ai_generated_plan: roadmapData as unknown as Json,
          milestones: roadmapData.milestones as unknown as Json,
          ai_model: 'template',
          prompt_version: 'v5-instant',
        })
        .select()
        .single()

      if (roadmapError) {
        throw new Error('Failed to save roadmap')
      }

      // Create progress stages
      const stages = roadmapData.phases.map((phase, index) => {
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

      return NextResponse.json({
        success: true,
        roadmapId: roadmap.id,
        instant: true,
      })
    }

    // No template found - fall back to fast generation
    return NextResponse.json({
      success: false,
      message: 'No template available, use standard generation',
    })
  } catch (error) {
    console.error('Instant generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 },
    )
  }
}