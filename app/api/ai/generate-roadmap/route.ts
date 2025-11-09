import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateRoadmapPrompt, ROADMAP_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { Json, TablesInsert, Goal } from '@/types/database'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const { goalId } = await request.json()

    const supabase = await createClient()

    // Combine user authentication and goal fetch in parallel
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

    // Type the goal properly
    const typedGoal: Goal = goal

    // Generate the roadmap using OpenAI with retry logic
    const prompt = generateRoadmapPrompt(
      typedGoal.title,
      typedGoal.current_level || 'beginner',
      typedGoal.daily_time_commitment || 30,
      typedGoal.target_date,
      typedGoal.weekly_schedule as Record<string, boolean>,
      typedGoal.start_date,
    )

    // Retry logic for reliability
    let completion
    let lastError
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`AI generation attempt ${attempt}/${maxRetries}`)

        completion = await openai.chat.completions.create(
          {
            model: AI_MODELS.roadmap,
            messages: [
              {
                role: 'system',
                content: ROADMAP_SYSTEM_PROMPT,
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 8000, // Optimized for faster generation while maintaining quality
          },
          {
            timeout: 60000, // 1 minute timeout for better performance
          },
        )

        // If we get here, the request succeeded
        break
      } catch (error) {
        logger.error(`AI generation attempt ${attempt} failed`, { error, attempt, maxRetries })
        lastError = error

        if (attempt < maxRetries) {
          // Optimized backoff: shorter delays for faster retries
          const waitTime = attempt * 500 // 500ms, 1000ms delays instead of 2s, 4s
          logger.debug(`Retrying AI generation`, { waitTime, attempt })
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }

    if (!completion) {
      logger.error('All AI generation attempts failed', { lastError })
      throw lastError || new Error('AI generation failed after all retries')
    }

    let roadmapData

    try {
      let content = completion.choices[0].message.content!
      logger.debug('API - Received AI response', { length: content.length })

      // Optimized JSON cleanup
      content = content.trim()

      // Fast path for clean JSON
      if (content.startsWith('{') && content.endsWith('}')) {
        roadmapData = JSON.parse(content)
      } else {
        // Fallback cleanup for malformed responses
        const jsonStart = content.indexOf('{')
        const jsonEnd = content.lastIndexOf('}')
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          content = content.substring(jsonStart, jsonEnd + 1)
          roadmapData = JSON.parse(content)
        } else {
          throw new Error('No valid JSON found in response')
        }
      }

      // Validate that we have a complete response
      if (
        !roadmapData.phases ||
        !Array.isArray(roadmapData.phases) ||
        roadmapData.phases.length < 3
      ) {
        logger.error('API - Incomplete AI response', {
          phasesGenerated: roadmapData.phases?.length || 0,
          expected: '6-12'
        })
        throw new Error(
          `Incomplete AI response: only ${roadmapData.phases?.length || 0} phases generated, expected 6-12`,
        )
      }

      logger.debug('API - AI response validated', {
        phasesGenerated: roadmapData.phases.length
      })
    } catch (parseError) {
      logger.error('API - Failed to parse JSON', { error: parseError })
      logger.error('API - Raw content', { content: completion.choices[0].message.content })
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 },
      )
    }

    // Prepare stage data in parallel while saving roadmap
    const stageCreationPromise =
      roadmapData.phases && roadmapData.phases.length > 0
        ? prepareStageData(roadmapData.phases, typedGoal.start_date)
        : null

    // Save the roadmap to database
    const roadmapInsert: TablesInsert<'roadmaps'> = {
      goal_id: goalId,
      ai_generated_plan: roadmapData as unknown as Json,
      milestones: (roadmapData.milestones || []) as unknown as Json,
      ai_model: AI_MODELS.roadmap,
      prompt_version: 'v1',
    }

    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert(roadmapInsert)
      .select('*')
      .single()

    if (roadmapError) {
      return NextResponse.json(
        { error: 'Failed to save roadmap' },
        { status: 500 },
      )
    }

    // Create stage records only (no tasks initially)
    if (stageCreationPromise) {
      logger.debug('Creating stages for roadmap', {
        phaseCount: roadmapData.phases.length,
        roadmapId: roadmap.id
      })
      try {
        const stageRecords = await stageCreationPromise
        await createProgressStagesFromRecords(
          supabase,
          roadmap.id,
          stageRecords,
        )
        logger.debug('Stages created successfully')
      } catch (stageError) {
        logger.error('Failed to create stages', { error: stageError })
        // Continue anyway - stages can be created later
      }
      // Tasks will be generated on-demand per stage when user clicks "Generate Tasks"
    } else {
      logger.debug('No stages found in roadmap data')
    }

    return NextResponse.json(roadmap)
  } catch (error) {
    logger.error('OpenAI API error', { error })
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 },
    )
  }
}

// Type for AI-generated phase data (before database insertion)
interface AIGeneratedPhase {
  id?: string
  title: string
  description: string
  duration_weeks?: number
  skills_to_learn?: string[]
  learning_objectives?: string[]
  key_concepts?: string[]
  prerequisites?: string[]
  outcomes?: string[]
  resources?: string[] | Record<string, unknown> | unknown
  daily_tasks?: Array<{
    title: string
    description?: string
    estimated_minutes?: number
    type?: string
  }>
  tasks?: string[]
}

// Type for database stage record preparation
type StageRecordForInsert = Omit<TablesInsert<'progress_stages'>, 'roadmap_id'>

// Optimized function to prepare stage data without database calls
async function prepareStageData(
  stages: AIGeneratedPhase[],
  startDate: string,
): Promise<StageRecordForInsert[]> {
  let weekOffset = 0
  const stageRecords: StageRecordForInsert[] = []

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const stageStartDate = new Date(startDate)
    stageStartDate.setDate(stageStartDate.getDate() + weekOffset * 7)

    const durationWeeks = stage.duration_weeks || 4
    const stageEndDate = new Date(stageStartDate)
    stageEndDate.setDate(stageEndDate.getDate() + durationWeeks * 7 - 1)

    stageRecords.push({
      phase_id: stage.id || `stage-${i + 1}`,
      phase_number: i + 1,
      title: stage.title,
      description: stage.description,
      duration_weeks: durationWeeks,
      skills_to_learn: stage.skills_to_learn || [],
      learning_objectives: stage.learning_objectives || [],
      key_concepts: stage.key_concepts || [],
      prerequisites: stage.prerequisites || [],
      outcomes: stage.outcomes || [],
      resources: (stage.resources as Json) || null,
      start_date: stageStartDate.toISOString().split('T')[0],
      end_date: stageEndDate.toISOString().split('T')[0],
      status: i === 0 ? 'active' : 'pending',
    })

    weekOffset += durationWeeks
  }

  return stageRecords
}

// Optimized function to insert pre-prepared stage records
async function createProgressStagesFromRecords(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roadmapId: string,
  stageRecords: StageRecordForInsert[],
) {
  // Add roadmap_id to each record
  const recordsWithRoadmapId: TablesInsert<'progress_stages'>[] =
    stageRecords.map((record) => ({
      ...record,
      roadmap_id: roadmapId,
    }))

  logger.debug('Inserting stages', { stageCount: recordsWithRoadmapId.length })

  const { data, error } = await supabase
    .from('progress_stages')
    .insert(recordsWithRoadmapId)
    .select('*')

  if (error) {
    logger.error('Failed to create stages', { error })
    throw error
  } else {
    logger.debug('Successfully created stages', { createdCount: data?.length })
  }
}
