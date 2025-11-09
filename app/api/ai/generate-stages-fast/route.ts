import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { Json, TablesInsert } from '@/types/database'

type ProgressStageInsert = TablesInsert<'progress_stages'>

// Template-based stage generation for speed
interface StageTemplate {
  title: string
  weeks: number
}

const STAGE_TEMPLATES: Record<'beginner' | 'intermediate', StageTemplate[]> = {
  beginner: [
    { title: 'Foundation & Basics', weeks: 2 },
    { title: 'Core Concepts', weeks: 2 },
    { title: 'Practical Application', weeks: 2 },
    { title: 'Building Skills', weeks: 2 },
    { title: 'Advanced Practice', weeks: 2 },
    { title: 'Mastery & Review', weeks: 2 },
  ],
  intermediate: [
    { title: 'Review & Assessment', weeks: 1 },
    { title: 'Advanced Fundamentals', weeks: 2 },
    { title: 'Specialized Skills', weeks: 3 },
    { title: 'Complex Applications', weeks: 3 },
    { title: 'Professional Practice', weeks: 2 },
    { title: 'Expert Techniques', weeks: 1 },
  ],
}

export async function POST(request: NextRequest) {
  try {
    const { roadmapId } = await request.json()

    const supabase = await createClient()

    // Get roadmap and goal data
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .select(
        `
        *,
        goals!inner(*)
      `,
      )
      .eq('id', roadmapId)
      .single()

    if (roadmapError || !roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    const goal = roadmap.goals
    const currentPlan = roadmap.ai_generated_plan as Record<string, unknown>

    // Quick stage generation based on templates
    const level = goal.current_level?.toLowerCase().includes('beginner')
      ? 'beginner'
      : 'intermediate'
    const template = STAGE_TEMPLATES[level]

    // Generate stage details with minimal AI call
    const prompt = `For the goal "${goal.title}", create learning content for these stages:
${template.map((s, i) => `${i + 1}. ${s.title} (${s.weeks} weeks)`).join('\n')}

Return a JSON with:
{
  "phases": [
    {
      "id": "phase-1",
      "title": "Stage title",
      "description": "1 sentence description",
      "duration_weeks": 2,
      "skills_to_learn": ["skill1", "skill2"],
      "key_concepts": ["concept1", "concept2"]
    }
  ]
}`

    const completion = await openai.chat.completions.create(
      {
        model: AI_MODELS.stages, // gpt-4o-mini for speed
        messages: [
          {
            role: 'system',
            content: 'Generate concise learning stages. Be extremely brief.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1500,
      },
      {
        timeout: 10000, // 10 seconds
      },
    )

    const stagesData = JSON.parse(completion.choices[0].message.content!)

    // Update roadmap
    const updatedPlan = {
      ...currentPlan,
      ...stagesData,
      stages_generated: true,
      generation_status: 'completed',
    }

    await supabase
      .from('roadmaps')
      .update({
        ai_generated_plan: updatedPlan as unknown as Json,
      })
      .eq('id', roadmapId)

    // Create progress stages
    interface Phase {
      id?: string
      title: string
      description?: string
      duration_weeks?: number
    }
    const stages: ProgressStageInsert[] = stagesData.phases.map((phase: Phase, index: number) => ({
      roadmap_id: roadmapId,
      phase_id: phase.id || `phase-${index + 1}`,
      phase_number: index + 1,
      title: phase.title,
      description: phase.description || '',
      duration_weeks: phase.duration_weeks || template[index].weeks,
      start_date: calculateStartDate(goal.start_date, index, template),
      end_date: calculateEndDate(goal.start_date, index, template),
    }))

    await supabase.from('progress_stages').insert(stages)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Fast stages generation error', { error })
    return NextResponse.json(
      { error: 'Failed to generate stages' },
      { status: 500 },
    )
  }
}

function calculateStartDate(
  startDate: string,
  index: number,
  template: StageTemplate[],
): string {
  const date = new Date(startDate)
  let weeks = 0
  for (let i = 0; i < index; i++) {
    weeks += template[i].weeks
  }
  date.setDate(date.getDate() + weeks * 7)
  return date.toISOString().split('T')[0]
}

function calculateEndDate(
  startDate: string,
  index: number,
  template: StageTemplate[],
): string {
  const date = new Date(startDate)
  let weeks = 0
  for (let i = 0; i <= index; i++) {
    weeks += template[i].weeks
  }
  date.setDate(date.getDate() + weeks * 7 - 1)
  return date.toISOString().split('T')[0]
}