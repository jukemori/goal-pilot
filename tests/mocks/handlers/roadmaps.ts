import { http, HttpResponse } from 'msw'
import { mockRoadmaps } from '../data/roadmaps'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'

export const roadmapsHandlers = [
  // Get roadmaps
  http.get(`${SUPABASE_URL}/rest/v1/roadmaps`, ({ request }) => {
    const url = new URL(request.url)
    const goalId = url.searchParams.get('goal_id')
    
    if (goalId) {
      const goalRoadmaps = mockRoadmaps.filter(roadmap => roadmap.goal_id === goalId)
      return HttpResponse.json(goalRoadmaps)
    }
    
    return HttpResponse.json(mockRoadmaps)
  }),

  // Get single roadmap
  http.get(`${SUPABASE_URL}/rest/v1/roadmaps/:id`, ({ params }) => {
    const roadmap = mockRoadmaps.find(r => r.id === params.id)
    
    if (!roadmap) {
      return HttpResponse.json(
        { error: 'Roadmap not found' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(roadmap)
  }),

  // Create roadmap (AI generation endpoint)
  http.post('/api/ai/generate-roadmap', async ({ request }) => {
    const body = await request.json() as any
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const newRoadmap = {
      id: crypto.randomUUID(),
      goal_id: body.goalId,
      ai_generated_plan: {
        overview: 'Mock AI-generated roadmap',
        phases: [
          {
            id: 'stage-1',
            title: 'Foundation Phase',
            description: 'Build the basics',
            duration_weeks: 4,
            skills_to_learn: ['Basic concepts', 'Fundamentals'],
          },
        ],
        total_hours_required: 100,
        estimated_completion_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      milestones: [],
      ai_model: 'gpt-4',
      prompt_version: 'v1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    mockRoadmaps.push(newRoadmap)
    return HttpResponse.json(newRoadmap)
  }),
]