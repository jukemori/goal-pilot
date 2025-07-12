import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import {
  generateTasksForPhasePrompt,
  TASK_GENERATION_SYSTEM_PROMPT,
} from '@/lib/ai/prompts'
import { Json, TablesInsert } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { phaseId, roadmapId } = await request.json()

    const supabase = await createClient()

    // Parallelize user authentication and stage fetch
    const [userResult, stageResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('progress_stages')
        .select(
          `
          *,
          roadmaps!inner(
            goal_id,
            ai_generated_plan,
            goals!inner(
              user_id,
              weekly_schedule,
              title,
              daily_time_commitment
            )
          )
        `,
        )
        .eq('id', phaseId)
        .single(),
    ])

    const {
      data: { user },
    } = userResult
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: stage, error: stageError } = stageResult
    if (stageError || !stage || stage.roadmaps.goals.user_id !== user.id) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
    }

    // Extract stage data from the roadmap - cast to Json then parse
    const aiPlan = stage.roadmaps.ai_generated_plan as Json
    const planData = aiPlan as {
      phases?: Array<{
        id?: string
        title: string
        description?: string
        skills_to_learn?: string[]
        learning_objectives?: string[]
        key_concepts?: string[]
      }>
    }
    const stages = planData?.phases || []
    const stageData =
      stages.find((p) => p.id === stage.phase_id) ||
      stages[stage.phase_number - 1]

    if (!stageData) {
      return NextResponse.json(
        { error: 'Stage data not found in roadmap' },
        { status: 404 },
      )
    }

    // Goal details are now available directly from the stage query
    const goal = {
      title: stage.roadmaps.goals.title,
      daily_time_commitment: stage.roadmaps.goals.daily_time_commitment,
    }

    // Generate tasks using AI
    const weeklySchedule = stage.roadmaps.goals.weekly_schedule as Record<
      string,
      boolean
    >

    const prompt = generateTasksForPhasePrompt(
      stageData.title,
      stageData.description || 'Stage',
      stageData.skills_to_learn || [],
      stageData.learning_objectives || [],
      stageData.key_concepts || [],
      stage.duration_weeks || 1,
      goal.daily_time_commitment || 30,
      weeklySchedule,
      stage.phase_number,
      goal.title,
    )

    console.log('Generating tasks with AI for stage:', stage.title)

    // AI generation with retry logic for reliability
    let completion
    let lastError
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI task generation attempt ${attempt}/${maxRetries}`)

        completion = await openai.chat.completions.create(
          {
            model: AI_MODELS.tasks,
            messages: [
              {
                role: 'system',
                content: TASK_GENERATION_SYSTEM_PROMPT,
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 2500, // Optimized for faster generation
          },
          {
            timeout: 45000, // 45 seconds timeout
          },
        )

        // If we get here, the request succeeded
        break
      } catch (error) {
        console.error(`AI task generation attempt ${attempt} failed:`, error)
        lastError = error

        if (attempt < maxRetries) {
          // Linear backoff for faster retries
          const waitTime = attempt * 300 // 300ms, 600ms delays
          console.log(`Retrying in ${waitTime}ms...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }

    if (!completion) {
      console.error('All AI task generation attempts failed')
      throw (
        lastError || new Error('AI task generation failed after all retries')
      )
    }

    let taskData
    try {
      let content = completion.choices[0].message.content!
      console.log('AI task generation response length:', content.length)

      // Optimized JSON cleanup with fast path
      content = content.trim()

      // Fast path for clean JSON
      if (content.startsWith('{') && content.endsWith('}')) {
        taskData = JSON.parse(content)
      } else {
        // Fallback cleanup for malformed responses
        const jsonStart = content.indexOf('{')
        const jsonEnd = content.lastIndexOf('}')
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          content = content.substring(jsonStart, jsonEnd + 1)
          taskData = JSON.parse(content)
        } else {
          throw new Error('No valid JSON found in AI response')
        }
      }

      console.log('Successfully parsed AI task data:', taskData)
    } catch (parseError) {
      console.error('Failed to parse AI task generation response:', parseError)
      console.error('Raw AI content:', completion.choices[0].message.content)
      return NextResponse.json(
        { error: 'Failed to generate tasks' },
        { status: 500 },
      )
    }

    // Pre-calculate available days for efficient scheduling
    const availableDays = Object.entries(weeklySchedule)
      .filter(([_, available]) => available)
      .map(([day]) => getDayNumber(day))

    console.log('Available days (0=Sun, 1=Mon, etc):', availableDays)
    console.log('Weekly schedule:', weeklySchedule)

    // Pre-calculate all available dates for the stage period
    const availableDates = calculateAvailableDates(
      stage.start_date || new Date().toISOString(),
      stage.end_date || new Date().toISOString(),
      availableDays,
    )

    console.log(
      `Pre-calculated ${availableDates.length} available dates for scheduling`,
    )

    const tasks: TablesInsert<'tasks'>[] = []

    // Extract AI-generated tasks and schedule them
    const taskPatterns = taskData?.task_patterns || []
    let allTasks: Array<{
      title: string
      description: string
      type: string
      estimated_minutes: number
    }> = []

    // Collect all tasks from all patterns
    taskPatterns.forEach((pattern: unknown) => {
      const patternObj = pattern as {
        weekly_tasks?: unknown[]
        weeks_duration?: number
      }
      const weeklyTasks = patternObj.weekly_tasks || []
      const patternWeeks = patternObj.weeks_duration || 1

      // Repeat the pattern for the specified number of weeks
      for (let week = 0; week < patternWeeks; week++) {
        weeklyTasks.forEach((task: unknown) => {
          const taskObj = task as {
            title?: string
            description?: string
            type?: string
            estimated_minutes?: number
          }
          allTasks.push({
            title: taskObj.title || 'Practice skills',
            description:
              taskObj.description || 'Practice and refine your skills',
            type: taskObj.type || 'practice',
            estimated_minutes:
              taskObj.estimated_minutes || goal.daily_time_commitment || 30,
          })
        })
      }
    })

    // If no AI tasks generated, use fallback
    if (allTasks.length === 0) {
      console.log('No AI tasks found, using fallback tasks')
      allTasks = [
        {
          title: 'Practice vocabulary',
          type: 'practice',
          description: 'Study and practice new words and phrases',
          estimated_minutes: goal.daily_time_commitment || 30,
        },
        {
          title: 'Study concepts',
          type: 'study',
          description: 'Learn and understand key concepts',
          estimated_minutes: goal.daily_time_commitment || 30,
        },
        {
          title: 'Apply knowledge',
          type: 'exercise',
          description: 'Apply what you have learned in practical exercises',
          estimated_minutes: goal.daily_time_commitment || 30,
        },
        {
          title: 'Practice skills',
          type: 'practice',
          description: 'Practice and refine your skills',
          estimated_minutes: goal.daily_time_commitment || 30,
        },
        {
          title: 'Review progress',
          type: 'review',
          description: 'Review previous lessons and practice materials',
          estimated_minutes: goal.daily_time_commitment || 30,
        },
      ]
    }

    // Efficiently schedule tasks using pre-calculated available dates
    availableDates.forEach((dateString: string, index: number) => {
      const baseTask = allTasks[index % allTasks.length]

      tasks.push({
        roadmap_id: roadmapId,
        title: baseTask.title,
        description: baseTask.description,
        scheduled_date: dateString,
        estimated_duration: baseTask.estimated_minutes,
        priority: getPriorityFromType(baseTask.type),
        phase_id: stage.phase_id,
        phase_number: stage.phase_number,
      })
    })

    console.log(`Generated ${tasks.length} tasks for stage: ${stage.title}`)
    console.log(
      `Date range: ${tasks[0]?.scheduled_date} to ${tasks[tasks.length - 1]?.scheduled_date}`,
    )

    // Insert tasks
    if (tasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(tasks)

      if (error) {
        console.error('Failed to create tasks:', error)
        return NextResponse.json(
          { error: 'Failed to create tasks' },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      message: 'Tasks generated successfully',
      tasksCount: tasks.length,
    })
  } catch (error) {
    console.error('Error generating stage tasks:', error)
    return NextResponse.json(
      { error: 'Failed to generate tasks' },
      { status: 500 },
    )
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

// Helper function to create consistent UTC dates from date strings
function createConsistentDate(dateString: string): Date {
  // Parse the date string as YYYY-MM-DD and create a UTC date
  // This ensures the date represents the intended calendar date consistently
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
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

// Optimized function to pre-calculate all available dates for the stage period
function calculateAvailableDates(
  startDateString: string,
  endDateString: string,
  availableDays: number[],
): string[] {
  const availableDates: string[] = []
  const currentDate = createConsistentDate(startDateString)
  const endDate = createConsistentDate(endDateString)

  while (currentDate <= endDate) {
    if (availableDays.includes(currentDate.getUTCDay())) {
      availableDates.push(currentDate.toISOString().split('T')[0])
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return availableDates
}
