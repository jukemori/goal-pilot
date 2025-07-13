import { http, HttpResponse } from 'msw'
import { mockGoals } from '../data/goals'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const goalsHandlers = [
  // Get goals
  http.get(`${SUPABASE_URL}/rest/v1/goals`, ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('user_id')
    
    if (userId) {
      const userGoals = mockGoals.filter(goal => goal.user_id === userId)
      return HttpResponse.json(userGoals)
    }
    
    return HttpResponse.json(mockGoals)
  }),

  // Get single goal
  http.get(`${SUPABASE_URL}/rest/v1/goals/:id`, ({ params }) => {
    const goal = mockGoals.find(g => g.id === params.id)
    
    if (!goal) {
      return HttpResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(goal)
  }),

  // Create goal
  http.post(`${SUPABASE_URL}/rest/v1/goals`, async ({ request }) => {
    const body = await request.json() as any
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
    const body = await request.json() as any
    
    const goalIndex = mockGoals.findIndex(g => g.id === id)
    if (goalIndex === -1) {
      return HttpResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
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
    const body = await request.json() as any
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