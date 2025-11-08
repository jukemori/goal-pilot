'use server'

import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import {
  generateRoadmapPrompt,
  generateRoadmapOverviewPrompt,
  generateStagesPrompt,
  ROADMAP_SYSTEM_PROMPT,
  STAGES_SYSTEM_PROMPT,
} from '@/lib/ai/prompts'
import type { RoadmapPlan } from '@/types'
import { Json, Goal } from '@/types/database'

interface RoadmapOverview {
  milestones?: unknown
  [key: string]: unknown
}

interface StagesData {
  phases: unknown[]
  [key: string]: unknown
}

// This is the old function that generates everything at once - keeping for backwards compatibility
export async function generateRoadmapLegacy(goalId: string) {
  try {
    const supabase = await createClient()

    // Get the goal details
    const { data: goalData, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single()

    const goal = goalData as Goal | null

    if (goalError || !goal) {
      throw new Error('Goal not found')
    }

    // Generate the roadmap using OpenAI
    const prompt = generateRoadmapPrompt(
      goal.title,
      goal.current_level || 'I am a complete beginner with no prior experience',
      goal.daily_time_commitment || 30,
      goal.target_date,
      goal.weekly_schedule as Record<string, boolean>,
      goal.start_date,
    )

    // Retry logic for reliability
    let completion
    let lastError
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI generation attempt ${attempt}/${maxRetries}`)

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
            max_tokens: 12000, // Increased from 3000 to allow for 6-12 detailed stages
          },
          {
            timeout: 120000, // 2 minutes timeout
          },
        )

        // If we get here, the request succeeded
        break
      } catch (error) {
        console.error(`AI generation attempt ${attempt} failed:`, error)
        lastError = error

        if (attempt < maxRetries) {
          // Exponential backoff: wait 2^attempt seconds
          const waitTime = Math.pow(2, attempt) * 1000
          console.log(`Retrying in ${waitTime}ms...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }

    if (!completion) {
      console.error('All AI generation attempts failed')
      throw lastError || new Error('AI generation failed after all retries')
    }

    let roadmapData: RoadmapPlan & {
      milestones: Array<{
        week: number
        title: string
        description: string
        deliverables: string[]
      }>
    }

    try {
      let content = completion.choices[0].message.content!
      console.log('Raw AI response length:', content.length)
      console.log('Raw AI response preview:', content.substring(0, 200) + '...')

      // Clean up common JSON issues
      content = content.trim()

      // Remove any text before the JSON starts
      const jsonStart = content.indexOf('{')
      if (jsonStart > 0) {
        content = content.substring(jsonStart)
      }

      // Remove any text after the JSON ends
      const jsonEnd = content.lastIndexOf('}')
      if (jsonEnd > 0 && jsonEnd < content.length - 1) {
        content = content.substring(0, jsonEnd + 1)
      }

      console.log('Cleaned content preview:', content.substring(0, 200) + '...')
      roadmapData = JSON.parse(content)

      // Validate that we have a complete response
      if (
        !roadmapData.phases ||
        !Array.isArray(roadmapData.phases) ||
        roadmapData.phases.length < 3
      ) {
        console.error(
          'Incomplete response: only',
          roadmapData.phases?.length || 0,
          'phases generated',
        )
        throw new Error(
          `Incomplete AI response: only ${roadmapData.phases?.length || 0} phases generated, expected 6-12`,
        )
      }

      console.log(
        'Complete response validated:',
        roadmapData.phases.length,
        'phases generated',
      )
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw content:', completion.choices[0].message.content)
      throw new Error(
        'Failed to parse AI response as JSON. The response may be incomplete or malformed.',
      )
    }

    // Save the roadmap to database
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        goal_id: goalId,
        ai_generated_plan: roadmapData as unknown as Json,
        milestones: (roadmapData.milestones || []) as unknown as Json,
        ai_model: AI_MODELS.roadmap,
        prompt_version: 'v1',
      })
      .select('*')
      .single()

    if (roadmapError) {
      throw new Error('Failed to save roadmap')
    }

    // Generate tasks for all phases
    if (roadmapData.phases && roadmapData.phases.length > 0) {
      await generateAllTasks(
        roadmap.id,
        roadmapData.phases,
        goal.start_date,
        goal.weekly_schedule as Record<string, boolean>,
      )
    }

    return roadmap
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate roadmap')
  }
}

async function generateAllTasks(
  roadmapId: string,
  phases: Array<{
    title: string
    daily_tasks?: Array<{
      title: string
      description?: string
      estimated_minutes?: number
      type?: string
    }>
    tasks?: string[]
  }>,
  startDate: string,
  weeklySchedule: Record<string, boolean>,
) {
  const supabase = await createClient()

  // Get available days of the week
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => getDayNumber(day))

  const allTasks: Array<{
    roadmap_id: string
    title: string
    description: string
    scheduled_date: string
    estimated_duration: number
    priority: number
  }> = []
  const currentDate = new Date(startDate)

  // Generate tasks for all phases
  for (const phase of phases) {
    const dailyTasks = phase.daily_tasks || phase.tasks || []

    // If using old format (tasks array), convert to daily_tasks format
    const normalizedTasks =
      Array.isArray(dailyTasks) && typeof dailyTasks[0] === 'string'
        ? (dailyTasks as string[]).map((title: string, index: number) => ({
            day: index + 1,
            title,
            description: `Part of ${phase.title}`,
            estimated_minutes: 30,
            type: 'practice',
          }))
        : (dailyTasks as Array<{
            title: string
            description?: string
            estimated_minutes?: number
            type?: string
          }>)

    // Generate tasks for this phase
    for (const dailyTask of normalizedTasks) {
      // Find next available day
      while (!availableDays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1)
      }

      allTasks.push({
        roadmap_id: roadmapId,
        title: dailyTask.title,
        description: dailyTask.description || `Part of ${phase.title}`,
        scheduled_date: currentDate.toISOString().split('T')[0],
        estimated_duration: dailyTask.estimated_minutes || 30,
        priority: getPriorityFromType(dailyTask.type || 'practice'),
      })

      // Move to next available day
      do {
        currentDate.setDate(currentDate.getDate() + 1)
      } while (!availableDays.includes(currentDate.getDay()))
    }
  }

  // Insert all tasks
  if (allTasks.length > 0) {
    const { error } = await supabase.from('tasks').insert(allTasks)

    if (error) {
      console.error('Failed to create tasks:', error)
    } else {
      console.log(`Generated ${allTasks.length} tasks for roadmap`)
    }
  }
}

function getDayNumber(dayName: string): number {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  }
  return dayMap[dayName.toLowerCase()] ?? 1
}

function getPriorityFromType(type: string): number {
  const priorityMap: Record<string, number> = {
    study: 5,
    practice: 4,
    exercise: 3,
    review: 2,
  }
  return priorityMap[type] || 3
}

// New split generation functions

// Step 1: Generate roadmap overview only
export async function generateRoadmapOverview(goalId: string) {
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

  // Generate the roadmap overview using OpenAI
  const prompt = generateRoadmapOverviewPrompt(
    goal.title,
    goal.current_level || 'I am a complete beginner with no prior experience',
    goal.daily_time_commitment || 30,
    goal.target_date,
    goal.weekly_schedule as Record<string, boolean>,
    goal.start_date,
  )

  // Retry logic for reliability
  let completion
  let lastError
  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI overview generation attempt ${attempt}/${maxRetries}`)

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
          max_tokens: 4000, // Smaller for overview only
        },
        {
          timeout: 120000, // 2 minutes timeout
        },
      )

      // If we get here, the request succeeded
      break
    } catch (error) {
      console.error(`AI overview generation attempt ${attempt} failed:`, error)
      lastError = error

      if (attempt < maxRetries) {
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`Retrying in ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  if (!completion) {
    console.error('All AI overview generation attempts failed')
    throw (
      lastError || new Error('AI overview generation failed after all retries')
    )
  }

  let roadmapOverview: RoadmapOverview

  try {
    let content = completion.choices[0].message.content!
    console.log('Raw AI overview response length:', content.length)

    // Clean up common JSON issues
    content = content.trim()

    // Remove any text before the JSON starts
    const jsonStart = content.indexOf('{')
    if (jsonStart > 0) {
      content = content.substring(jsonStart)
    }

    // Remove any text after the JSON ends
    const jsonEnd = content.lastIndexOf('}')
    if (jsonEnd > 0 && jsonEnd < content.length - 1) {
      content = content.substring(0, jsonEnd + 1)
    }

    roadmapOverview = JSON.parse(content)
    console.log('Overview generated successfully')
  } catch (parseError) {
    console.error('JSON parsing error:', parseError)
    console.error('Raw content:', completion.choices[0].message.content)
    throw new Error(
      'Failed to parse AI response as JSON. The response may be incomplete or malformed.',
    )
  }

  // Save the roadmap overview to database
  const { data: roadmap, error: roadmapError } = await supabase
    .from('roadmaps')
    .insert({
      goal_id: goalId,
      ai_generated_plan: {
        overview_generated: true,
        ...roadmapOverview,
      } as unknown as Json,
      milestones: (roadmapOverview.milestones || []) as unknown as Json,
      ai_model: AI_MODELS.roadmap,
      prompt_version: 'v2-overview',
    })
    .select('*')
    .single()

  if (roadmapError) {
    throw new Error('Failed to save roadmap overview')
  }

  return roadmap
}

// Step 2: Generate detailed stages based on overview
export async function generateRoadmapStages(roadmapId: string) {
  const supabase = await createClient()

  // Get the roadmap and goal details
  const { data: roadmap, error: roadmapError } = await supabase
    .from('roadmaps')
    .select(
      `
      *,
      goals (*)
    `,
    )
    .eq('id', roadmapId)
    .single()

  if (roadmapError || !roadmap) {
    throw new Error('Roadmap not found')
  }

  const goal = roadmap.goals as Goal
  const roadmapOverview = roadmap.ai_generated_plan as RoadmapOverview

  if (!goal) {
    throw new Error('Goal not found in roadmap')
  }

  // Generate the detailed stages using OpenAI
  const prompt = generateStagesPrompt(
    goal.title,
    goal.current_level || 'I am a complete beginner with no prior experience',
    roadmapOverview,
    goal.daily_time_commitment || 30,
    goal.weekly_schedule as Record<string, boolean>,
  )

  // Retry logic for reliability
  let completion
  let lastError
  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI stages generation attempt ${attempt}/${maxRetries}`)

      completion = await openai.chat.completions.create(
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
          temperature: 0.7,
          max_tokens: 8000, // Higher limit for GPT-4o-mini
        },
        {
          timeout: 120000, // 2 minutes timeout
        },
      )

      // If we get here, the request succeeded
      break
    } catch (error) {
      console.error(`AI stages generation attempt ${attempt} failed:`, error)
      lastError = error

      if (attempt < maxRetries) {
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`Retrying in ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  if (!completion) {
    console.error('All AI stages generation attempts failed')
    throw (
      lastError || new Error('AI stages generation failed after all retries')
    )
  }

  let stagesData: StagesData

  try {
    let content = completion.choices[0].message.content!
    console.log('Raw AI stages response length:', content.length)

    // Clean up common JSON issues
    content = content.trim()

    // Remove any text before the JSON starts
    const jsonStart = content.indexOf('{')
    if (jsonStart > 0) {
      content = content.substring(jsonStart)
    }

    // Remove any text after the JSON ends
    const jsonEnd = content.lastIndexOf('}')
    if (jsonEnd > 0 && jsonEnd < content.length - 1) {
      content = content.substring(0, jsonEnd + 1)
    }

    stagesData = JSON.parse(content)

    // Validate that we have complete stages
    if (
      !stagesData.phases ||
      !Array.isArray(stagesData.phases) ||
      stagesData.phases.length < 3
    ) {
      console.error(
        'Incomplete stages response: only',
        stagesData.phases?.length || 0,
        'phases generated',
      )
      throw new Error(
        `Incomplete AI response: only ${stagesData.phases?.length || 0} phases generated, expected 6-12`,
      )
    }

    console.log(
      'Complete stages response validated:',
      stagesData.phases.length,
      'phases generated',
    )
  } catch (parseError) {
    console.error('JSON parsing error:', parseError)
    console.error('Raw content:', completion.choices[0].message.content)
    throw new Error(
      'Failed to parse AI response as JSON. The response may be incomplete or malformed.',
    )
  }

  // Update the roadmap with complete data
  const completeRoadmapData = {
    ...(roadmapOverview as object),
    ...(stagesData as object),
    stages_generated: true,
  }

  const { data: updatedRoadmap, error: updateError } = await supabase
    .from('roadmaps')
    .update({
      ai_generated_plan: completeRoadmapData as unknown as Json,
      ai_model: `${AI_MODELS.roadmap}+${AI_MODELS.stages}`,
      prompt_version: 'v2-complete',
    })
    .eq('id', roadmapId)
    .select('*')
    .single()

  if (updateError) {
    throw new Error('Failed to update roadmap with stages')
  }

  // Tasks will be generated per-stage on demand via the generate-phase API
  // This prevents duplicate task generation

  return updatedRoadmap
}

// New main function that uses split generation
export async function generateRoadmap(goalId: string) {
  // Step 1: Generate overview
  const roadmap = await generateRoadmapOverview(goalId)

  // Step 2: Generate stages
  const completeRoadmap = await generateRoadmapStages(roadmap.id)

  return completeRoadmap
}
