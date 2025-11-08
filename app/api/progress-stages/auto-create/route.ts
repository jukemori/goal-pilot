import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Json } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { roadmapId } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get roadmap with goal info
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .select(
        `
        *,
        goals!inner(
          user_id,
          start_date
        )
      `,
      )
      .eq('id', roadmapId)
      .eq('goals.user_id', user.id)
      .single()

    if (roadmapError || !roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    // Check if progress stages already exist
    const { data: existingPhases } = await supabase
      .from('progress_stages')
      .select('id')
      .eq('roadmap_id', roadmapId)
      .limit(1)

    if (existingPhases && existingPhases.length > 0) {
      return NextResponse.json({
        message: 'Progress stages already exist',
      })
    }

    // Extract phases from roadmap
    const aiPlan = roadmap.ai_generated_plan as Json
    const planData = aiPlan as {
      phases?: Array<{
        id?: string
        title: string
        description?: string
        skills_to_learn?: string[]
        learning_objectives?: string[]
        key_concepts?: string[]
        prerequisites?: string[]
        outcomes?: string[]
        resources?: string[]
        duration_weeks?: number
      }>
    }
    const phases = planData?.phases || []
    if (phases.length === 0) {
      return NextResponse.json(
        { error: 'No phases found in roadmap' },
        { status: 400 },
      )
    }

    // Create learning phases
    const learningPhases = []
    let weekOffset = 0

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      const phaseStartDate = new Date(roadmap.goals.start_date)
      phaseStartDate.setDate(phaseStartDate.getDate() + weekOffset * 7)

      const durationWeeks = phase.duration_weeks || 4
      const phaseEndDate = new Date(phaseStartDate)
      phaseEndDate.setDate(phaseEndDate.getDate() + durationWeeks * 7 - 1)

      learningPhases.push({
        roadmap_id: roadmapId,
        phase_id: phase.id || `phase-${i + 1}`,
        phase_number: i + 1,
        title: phase.title,
        description: phase.description,
        duration_weeks: durationWeeks,
        skills_to_learn: phase.skills_to_learn || [],
        learning_objectives: phase.learning_objectives || [],
        key_concepts: phase.key_concepts || [],
        prerequisites: phase.prerequisites || [],
        outcomes: phase.outcomes || [],
        resources: phase.resources || [],
        start_date: phaseStartDate.toISOString().split('T')[0],
        end_date: phaseEndDate.toISOString().split('T')[0],
        status: i === 0 ? 'active' : 'pending',
      })

      weekOffset += durationWeeks
    }

    // Double-check for existing phases by roadmap_id and phase_id combinations
    const existingPhaseIds = new Set()
    const { data: existingPhasesDetailed } = await supabase
      .from('progress_stages')
      .select('phase_id')
      .eq('roadmap_id', roadmapId)

    if (existingPhasesDetailed) {
      existingPhasesDetailed.forEach((p) => existingPhaseIds.add(p.phase_id))
    }

    // Filter out phases that already exist
    const newPhases = learningPhases.filter(
      (phase) => !existingPhaseIds.has(phase.phase_id),
    )

    if (newPhases.length === 0) {
      return NextResponse.json({
        message: 'All learning phases already exist',
      })
    }

    const { data, error } = await supabase
      .from('progress_stages')
      .insert(newPhases)
      .select('*')

    if (error) {
      console.error('Failed to create learning phases:', error)
      return NextResponse.json(
        { error: 'Failed to create learning phases' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      message: `${newPhases.length} learning phases created successfully`,
      phases: data,
    })
  } catch (error) {
    console.error('Auto-create learning phases error:', error)
    return NextResponse.json(
      { error: 'Failed to create learning phases' },
      { status: 500 },
    )
  }
}
