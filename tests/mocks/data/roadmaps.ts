import type { Tables } from '@/types/database'

export const mockRoadmaps: Tables<'roadmaps'>[] = [
  {
    id: 'roadmap-1',
    goal_id: 'goal-1',
    ai_generated_plan: {
      overview: 'A comprehensive roadmap to master web development',
      phases: [
        {
          id: 'stage-1',
          title: 'HTML & CSS Fundamentals',
          description: 'Master the building blocks of web development',
          duration_weeks: 4,
          skills_to_learn: [
            'HTML5 semantic elements',
            'CSS Box Model',
            'Flexbox',
            'Grid',
          ],
          learning_objectives: [
            'Build responsive layouts',
            'Understand CSS specificity',
          ],
          outcomes: ['Create a portfolio website'],
        },
        {
          id: 'stage-2',
          title: 'JavaScript Essentials',
          description: 'Learn JavaScript programming fundamentals',
          duration_weeks: 6,
          skills_to_learn: [
            'Variables and data types',
            'Functions',
            'DOM manipulation',
            'ES6+ features',
          ],
          learning_objectives: [
            'Write interactive web applications',
            'Handle user events',
          ],
          outcomes: ['Build interactive web components'],
        },
      ],
      total_hours_required: 240,
      estimated_completion_date: '2024-06-01T00:00:00.000Z',
    },
    milestones: [],
    ai_model: 'gpt-4',
    prompt_version: 'v1',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'roadmap-2',
    goal_id: 'goal-2',
    ai_generated_plan: {
      overview: 'Transform your fitness with a structured workout plan',
      phases: [
        {
          id: 'stage-1',
          title: 'Build Foundation Fitness',
          description: 'Establish workout habits and baseline fitness',
          duration_weeks: 8,
          skills_to_learn: ['Proper form', 'Basic exercises', 'Stretching'],
          learning_objectives: ['Develop consistency', 'Improve endurance'],
          outcomes: ['Complete 30-minute workouts'],
        },
      ],
      total_hours_required: 180,
      estimated_completion_date: '2024-12-31T00:00:00.000Z',
    },
    milestones: [],
    ai_model: 'gpt-4',
    prompt_version: 'v1',
    created_at: '2024-01-15T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
  },
]
