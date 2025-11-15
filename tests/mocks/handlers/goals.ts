import { http, HttpResponse } from 'msw'
import { mockGoals } from '../data/goals'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const goalsHandlers = [
  // Get goals
  http.get(`${SUPABASE_URL}/rest/v1/goals`, ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')

    if (userId) {
      const userGoals = mockGoals.filter((goal) => goal.user_id === userId)
      return HttpResponse.json(userGoals)
    }

    return HttpResponse.json(mockGoals)
  }),

  // Get single goal
  http.get(`${SUPABASE_URL}/rest/v1/goals`, ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (id && id.startsWith('eq.')) {
      const goalId = id.replace('eq.', '')
      const goal = mockGoals.find((g) => g.id === goalId)

      if (!goal) {
        return HttpResponse.json({ error: 'Goal not found' }, { status: 404 })
      }

      // Return single goal with roadmap relationships
      return HttpResponse.json({
        ...goal,
        roadmaps: [
          {
            id: 'roadmap-1',
            ai_generated_plan: { overview: 'Test plan' },
            milestones: [],
            created_at: '2024-01-01T00:00:00.000Z',
            tasks: [],
          },
        ],
      })
    }

    // Default behavior for listing goals
    const userId = url.searchParams.get('user_id')
    if (userId) {
      const userGoals = mockGoals.filter((goal) => goal.user_id === userId)
      return HttpResponse.json(userGoals)
    }

    return HttpResponse.json(mockGoals)
  }),

  // Create goal
  http.post(`${SUPABASE_URL}/rest/v1/goals`, async ({ request }) => {
    const body = (await request.json()) as any
    const newGoal = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body,
    }

    mockGoals.push(newGoal)
    return HttpResponse.json(newGoal, { status: 201 })
  }),

  // Update goal
  http.patch(`${SUPABASE_URL}/rest/v1/goals`, async ({ request }) => {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const body = (await request.json()) as any

    const goalIndex = mockGoals.findIndex((g) => g.id === id)
    if (goalIndex === -1) {
      return HttpResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      ...body,
      updated_at: new Date().toISOString(),
    }

    return HttpResponse.json(mockGoals[goalIndex])
  }),

  // Next.js API routes
  http.post('/api/goals', async ({ request }) => {
    const body = (await request.json()) as any
    const newGoal = {
      id: crypto.randomUUID(),
      user_id: 'test-user-123',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      ...body,
    }

    mockGoals.push(newGoal)
    return HttpResponse.json(newGoal, { status: 201 })
  }),
]
