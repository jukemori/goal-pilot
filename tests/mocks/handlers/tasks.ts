import { http, HttpResponse } from 'msw'
import { mockTasks } from '../data/tasks'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const tasksHandlers = [
  // Get tasks
  http.get(`${SUPABASE_URL}/rest/v1/tasks`, ({ request }) => {
    const url = new URL(request.url)
    const roadmapId = url.searchParams.get('roadmap_id')
    const scheduledDate = url.searchParams.get('scheduled_date')

    let filteredTasks = [...mockTasks]

    if (roadmapId) {
      filteredTasks = filteredTasks.filter(
        (task) => task.roadmap_id === roadmapId,
      )
    }

    if (scheduledDate) {
      filteredTasks = filteredTasks.filter((task) =>
        task.scheduled_date?.startsWith(scheduledDate),
      )
    }

    return HttpResponse.json(filteredTasks)
  }),

  // Update task (for marking complete/incomplete)
  http.patch(`${SUPABASE_URL}/rest/v1/tasks`, async ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const body = (await request.json()) as any

    const taskIndex = mockTasks.findIndex((t) => t.id === id)
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockTasks[taskIndex])
  }),

  // Create task
  http.post(`${SUPABASE_URL}/rest/v1/tasks`, async ({ request }) => {
    const body = (await request.json()) as any
    const newTask = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed: false,
      priority: 1,
      ...body,
    }

    mockTasks.push(newTask)
    return HttpResponse.json(newTask, { status: 201 })
  }),
]
