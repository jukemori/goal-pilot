import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { TablesInsert } from '@/types/database'
import { logger } from '@/lib/utils/logger'

type TaskInsert = TablesInsert<'tasks'>

// Simplified prompt for faster generation
const FAST_TASK_PROMPT = `Generate a JSON object with daily tasks for a learning phase.

Phase: {{phase_title}}
Duration: {{duration_weeks}} weeks
Time per day: {{daily_time}} minutes
Available days: {{available_days}}

Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Brief description",
      "type": "study|practice|exercise|review",
      "minutes": 30
    }
  ]
}

Generate 5-7 varied tasks that repeat throughout the phase. Focus on practical, actionable tasks.`

export async function POST(request: NextRequest) {
  try {
    const { phaseId, roadmapId } = await request.json()

    const supabase = await createClient()

    // Parallelize authentication and data fetching
    const [userResult, stageResult] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('progress_stages')
        .select(
          `
          *,
          roadmaps!inner(
            goal_id,
            goals!inner(
              user_id,
              weekly_schedule,
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

    const weeklySchedule = stage.roadmaps.goals.weekly_schedule as Record<
      string,
      boolean
    >
    const availableDays = Object.entries(weeklySchedule)
      .filter(([_, available]) => available)
      .map(([day]) => day)
      .join(', ')

    // Generate tasks with minimal prompt
    const prompt = FAST_TASK_PROMPT.replace('{{phase_title}}', stage.title)
      .replace('{{duration_weeks}}', String(stage.duration_weeks || 1))
      .replace(
        '{{daily_time}}',
        String(stage.roadmaps.goals.daily_time_commitment || 30),
      )
      .replace('{{available_days}}', availableDays)

    // Single AI call with aggressive optimization
    const completion = await openai.chat.completions.create(
      {
        model: AI_MODELS.tasks, // gpt-4o-mini
        messages: [
          {
            role: 'system',
            content:
              'You are a task generator. Return only valid JSON, no explanation.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower for consistency
        max_tokens: 800, // Much lower limit
        seed: phaseId.charCodeAt(0), // Consistent results for same phase
      },
      {
        timeout: 10000, // 10 seconds timeout
      },
    )

    const taskData = JSON.parse(completion.choices[0].message.content!)

    // Pre-calculate all dates
    const availableDaysNumbers = Object.entries(weeklySchedule)
      .filter(([_, available]) => available)
      .map(([day]) => getDayNumber(day))

    const dates = calculateAllDates(
      stage.start_date || new Date().toISOString(),
      stage.end_date || new Date().toISOString(),
      availableDaysNumbers,
    )

    // Generate tasks efficiently
    const tasks: TaskInsert[] = []
    const baseTasks = taskData.tasks || getDefaultTasks()

    dates.forEach((date, index) => {
      const baseTask = baseTasks[index % baseTasks.length]
      tasks.push({
        roadmap_id: roadmapId,
        title: baseTask.title,
        description: baseTask.description,
        scheduled_date: date,
        estimated_duration: baseTask.minutes || 30,
        priority: getPriorityFromType(baseTask.type || 'practice'),
        phase_id: stage.phase_id,
        phase_number: stage.phase_number,
      })
    })

    // Batch insert
    if (tasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(tasks)

      if (error) {
        logger.error('Failed to create tasks', { error })
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
    logger.error('Error generating tasks', { error })
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

function getPriorityFromType(type: string): number {
  const priorityMap: Record<string, number> = {
    study: 5,
    practice: 4,
    exercise: 3,
    review: 2,
  }
  return priorityMap[type] || 3
}

function calculateAllDates(
  startDate: string,
  endDate: string,
  availableDays: number[],
): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    if (availableDays.includes(current.getUTCDay())) {
      dates.push(current.toISOString().split('T')[0])
    }
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}

function getDefaultTasks() {
  return [
    {
      title: 'Learn new concepts',
      description: 'Study and understand key concepts',
      type: 'study',
      minutes: 30,
    },
    {
      title: 'Practice exercises',
      description: 'Apply knowledge through practice',
      type: 'practice',
      minutes: 30,
    },
    {
      title: 'Review material',
      description: 'Review and reinforce learning',
      type: 'review',
      minutes: 30,
    },
  ]
}
