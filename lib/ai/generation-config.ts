import { OpenAI } from 'openai'
import { Phase, RoadmapPlan, RoadmapPhase, Milestone } from '@/types'

// Optimized generation configurations for faster response times

export const GENERATION_CONFIG = {
  roadmap: {
    // Split generation into smaller chunks for faster initial response
    overview: {
      max_tokens: 1500, // Reduced from 8000
      temperature: 0.7,
      model: 'gpt-4o-mini', // Faster model for overview
    },
    phases: {
      max_tokens: 1000, // Per phase
      temperature: 0.7,
      model: 'gpt-4o-mini',
    },
  },
  tasks: {
    max_tokens: 2000, // Reduced from default
    temperature: 0.7,
    model: 'gpt-4o-mini',
    // Generate tasks in batches
    batch_size: 5,
  },
  // Parallel generation settings
  parallel: {
    max_concurrent: 3, // Generate up to 3 phases in parallel
    timeout_per_request: 15000, // 15s per request instead of 60s
  },
  // Retry settings optimized for speed
  retry: {
    max_attempts: 2, // Reduced from 3
    initial_delay: 300, // Reduced from 500ms
    max_delay: 1000, // Reduced from 2000ms
  },
}

interface GoalData {
  title: string
  current_level: string
  daily_time_commitment: number
  target_date: string | null
  weekly_schedule: Record<string, boolean>
  start_date: string
}

interface RoadmapOverview {
  overview: string
  phaseTitles: string[]  // This will be used to generate phases
  estimated_completion_date: string
  total_hours_required: number
  milestones: Milestone[]
  roadmap_phases: RoadmapPhase[]
}

// Helper to generate roadmap in chunks
export async function generateRoadmapInChunks(
  openai: OpenAI,
  goalData: GoalData,
  onProgress?: (phase: Phase, index: number) => void
): Promise<RoadmapPlan> {
  // First, generate a quick overview with phase titles
  const overview = await generateOverview(openai, goalData)
  
  // Then generate detailed phases in parallel
  const phases = await Promise.all(
    overview.phaseTitles.map(async (phaseTitle: string, index: number) => {
      const phase = await generatePhaseDetails(openai, goalData, phaseTitle, index)
      onProgress?.(phase, index)
      return phase
    })
  )
  
  // Construct the final RoadmapPlan object
  const roadmapPlan: RoadmapPlan = {
    overview: overview.overview,
    phases: phases,
    estimated_completion_date: overview.estimated_completion_date,
    total_hours_required: overview.total_hours_required,
    milestones: overview.milestones,
    roadmap_phases: overview.roadmap_phases,
  }
  
  return roadmapPlan
}

async function generateOverview(openai: OpenAI, goalData: GoalData): Promise<RoadmapOverview> {
  // Quick generation of roadmap structure
  const response = await openai.chat.completions.create({
    model: GENERATION_CONFIG.roadmap.overview.model,
    messages: [
      {
        role: 'system',
        content: 'Generate a concise roadmap overview with phase titles only.',
      },
      {
        role: 'user',
        content: `Create a learning roadmap overview for: ${goalData.title}`,
      },
    ],
    max_tokens: GENERATION_CONFIG.roadmap.overview.max_tokens,
    temperature: GENERATION_CONFIG.roadmap.overview.temperature,
  })
  
  return JSON.parse(response.choices[0].message.content!) as RoadmapOverview
}

async function generatePhaseDetails(
  openai: OpenAI,
  goalData: GoalData,
  phaseTitle: string,
  phaseIndex: number
): Promise<Phase> {
  // Generate detailed phase information
  const response = await openai.chat.completions.create({
    model: GENERATION_CONFIG.roadmap.phases.model,
    messages: [
      {
        role: 'system',
        content: 'Generate detailed phase information.',
      },
      {
        role: 'user',
        content: `Generate details for phase ${phaseIndex + 1}: ${phaseTitle}
Goal: ${goalData.title}
Level: ${goalData.current_level}
Daily commitment: ${goalData.daily_time_commitment} minutes`,
      },
    ],
    max_tokens: GENERATION_CONFIG.roadmap.phases.max_tokens,
    temperature: GENERATION_CONFIG.roadmap.phases.temperature,
  })
  
  return JSON.parse(response.choices[0].message.content!) as Phase
}