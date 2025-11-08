import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { Json, TablesInsert } from '@/types/database'

type RoadmapInsert = TablesInsert<'roadmaps'>

// Simplified prompt for faster generation
const FAST_OVERVIEW_PROMPT = `Create a learning roadmap overview for: {{goal}}

Current level: {{level}}
Time commitment: {{time}} minutes/day
Available days: {{days}} days/week

Generate a JSON with this structure:
{
  "overview": "Brief 1-2 sentence overview",
  "approach": "Learning approach in 1-2 sentences",
  "phases_count": 6,
  "estimated_duration_weeks": 12,
  "milestones": [
    {
      "week": 4,
      "title": "Milestone title",
      "description": "Brief description"
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const { goalId } = await request.json()

    const supabase = await createClient()

    // Get user and goal in parallel
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

    const weeklySchedule = goal.weekly_schedule as Record<string, boolean>
    const availableDays = Object.values(weeklySchedule).filter(Boolean).length

    // Generate with minimal prompt
    const prompt = FAST_OVERVIEW_PROMPT.replace('{{goal}}', goal.title)
      .replace('{{level}}', goal.current_level || 'beginner')
      .replace('{{time}}', String(goal.daily_time_commitment || 30))
      .replace('{{days}}', String(availableDays))

    const completion = await openai.chat.completions.create(
      {
        model: AI_MODELS.roadmap, // gpt-4o for quality
        messages: [
          {
            role: 'system',
            content: 'Generate a concise learning roadmap overview. Be brief.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 800, // Much smaller
      },
      {
        timeout: 15000, // 15 seconds
      },
    )

    const overviewData = JSON.parse(completion.choices[0].message.content!)

    // Save immediately
    const roadmapInsert: RoadmapInsert = {
      goal_id: goalId,
      ai_generated_plan: {
        ...overviewData,
        generation_status: 'overview_only',
        fast_generation: true,
      } as unknown as Json,
      milestones: (overviewData.milestones || []) as unknown as Json,
      ai_model: AI_MODELS.roadmap,
      prompt_version: 'v4-fast',
    }

    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert(roadmapInsert)
      .select('*')
      .single()

    if (roadmapError) {
      throw new Error('Failed to save roadmap')
    }

    return NextResponse.json({
      success: true,
      roadmapId: roadmap.id,
    })
  } catch (error) {
    console.error('Fast overview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate overview' },
      { status: 500 },
    )
  }
}