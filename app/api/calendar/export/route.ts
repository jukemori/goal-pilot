import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Task } from '@/types'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // For calendar export, we'll make it work without strict auth for now
    // In production, you might want to use API keys or tokens
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user in session, we'll still try to export (useful for testing)
    // In production, you should enforce authentication

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'ics'
    const goalId = searchParams.get('goalId')

    // Build query
    let query = supabase
      .from('tasks')
      .select(
        `
        *,
        roadmaps!inner(
          goal_id,
          goals!inner(
            title,
            user_id
          )
        )
      `,
      )
      .order('scheduled_date')

    // If user is authenticated, filter by user
    if (user) {
      query = query.eq('roadmaps.goals.user_id', user.id)
    }

    if (goalId) {
      query = query.eq('roadmaps.goal_id', goalId)
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 },
      )
    }

    logger.debug('Calendar export: Found tasks', {
      count: tasks?.length || 0,
      dateRange: tasks && tasks.length > 0 ? {
        start: tasks[0].scheduled_date,
        end: tasks[tasks.length - 1].scheduled_date
      } : null
    })

    if (format === 'ics') {
      const icsContent = generateICS(tasks || [])
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar',
          'Content-Disposition': 'attachment; filename="goal-pilot-tasks.ics"',
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    logger.error('Calendar export error', { error })
    return NextResponse.json(
      { error: 'Failed to export calendar' },
      { status: 500 },
    )
  }
}

interface TaskWithRelations extends Task {
  roadmaps: {
    goals: {
      title: string
    }
  }
}

function generateICS(tasks: TaskWithRelations[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Goal Pilot//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  tasks.forEach((task) => {
    const uid = `${task.id}@goal-pilot.com`
    const taskDate = new Date(task.scheduled_date)

    // Set a specific time (9:00 AM) for the task
    taskDate.setHours(9, 0, 0, 0)
    const dtstart = taskDate
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')

    // End time is start time + estimated duration (default 30 minutes)
    const endDate = new Date(taskDate)
    endDate.setMinutes(endDate.getMinutes() + 30) // Default duration
    const dtend = endDate
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')

    const created = new Date(task.created_at || new Date())
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
    const modified = new Date(task.updated_at || new Date())
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `CREATED:${created}`,
      `LAST-MODIFIED:${modified}`,
      `SUMMARY:${escapeICS(task.title)}`,
      `DESCRIPTION:${escapeICS(task.description || '')} - Goal: ${escapeICS(task.roadmaps.goals.title)}`,
      `STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      `PRIORITY:${6 - (task.priority || 3)}`, // ICS priority is inverted (1=highest, 9=lowest)
      'END:VEVENT',
    )
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}
