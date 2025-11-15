import { NextRequest } from 'next/server'
import { logger } from '@/lib/utils/logger'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateRoadmapPrompt, ROADMAP_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { Json, TablesInsert, Goal } from '@/types/database'
import { RoadmapPlan } from '@/types'

interface RequestBody {
  goalId: string
}

// Removed unused StreamMessage interface

export async function POST(request: NextRequest) {
  try {
    const { goalId }: RequestBody = await request.json()

    const supabase = await createClient()

    // Authenticate and fetch goal
    const [userResult, goalResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('goals').select('*').eq('id', goalId).single(),
    ])

    const {
      data: { user },
    } = userResult
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: goal, error: goalError } = goalResult
    if (goalError || !goal || goal.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Goal not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const typedGoal: Goal = goal

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'status',
                message: 'Analyzing your goal...',
              })}\n\n`,
            ),
          )

          const prompt = generateRoadmapPrompt(
            typedGoal.title,
            typedGoal.current_level || 'beginner',
            typedGoal.daily_time_commitment || 30,
            typedGoal.target_date,
            typedGoal.weekly_schedule as Record<string, boolean>,
            typedGoal.start_date,
          )

          // Stream generation with OpenAI
          const completion = await openai.chat.completions.create({
            model: AI_MODELS.roadmap,
            messages: [
              { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 8000,
            stream: true, // Enable streaming
          })

          let fullContent = ''
          let phaseCount = 0
          let lastPhaseUpdate = Date.now()

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            fullContent += content

            // Send progress updates when we detect phase completions
            if (
              content.includes('"title"') &&
              Date.now() - lastPhaseUpdate > 500
            ) {
              phaseCount++
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'progress',
                    message: `Creating phase ${phaseCount}...`,
                    phaseCount,
                  })}\n\n`,
                ),
              )
              lastPhaseUpdate = Date.now()
            }
          }

          // Parse the complete response
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'status',
                message: 'Finalizing your roadmap...',
              })}\n\n`,
            ),
          )

          const roadmapData = JSON.parse(fullContent.trim()) as RoadmapPlan

          // Save to database
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
            throw roadmapError
          }

          // Create stages
          if (roadmapData.phases?.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'status',
                  message: 'Creating learning stages...',
                })}\n\n`,
              ),
            )

            // Create stages logic here...
          }

          // Send completion
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'complete',
                roadmap,
              })}\n\n`,
            ),
          )
        } catch (error) {
          logger.error('Streaming error', { error })
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: 'Generation failed',
              })}\n\n`,
            ),
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    logger.error('API error', { error })
    return new Response(
      JSON.stringify({ error: 'Failed to start generation' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
