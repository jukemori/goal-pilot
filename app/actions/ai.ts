'use server'

import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateRoadmapPrompt, ROADMAP_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { RoadmapPlan } from '@/types'

export async function generateRoadmap(goalId: string) {
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

  // Generate the roadmap using OpenAI
  const prompt = generateRoadmapPrompt(
    goal.title,
    goal.current_level,
    goal.daily_time_commitment,
    goal.target_date,
    goal.weekly_schedule as Record<string, boolean>
  )

  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.roadmap,
      messages: [
        { role: 'system', content: ROADMAP_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const roadmapData = JSON.parse(completion.choices[0].message.content!) as RoadmapPlan & { milestones: any[] }
    
    // Save the roadmap to database
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        goal_id: goalId,
        ai_generated_plan: roadmapData,
        milestones: roadmapData.milestones || [],
        ai_model: AI_MODELS.roadmap,
        prompt_version: 'v1',
      })
      .select()
      .single()

    if (roadmapError) {
      throw new Error('Failed to save roadmap')
    }

    // Generate initial tasks for the first phase
    if (roadmapData.phases && roadmapData.phases.length > 0) {
      await generateTasksForPhase(roadmap.id, roadmapData.phases[0], goal.start_date)
    }

    return roadmap
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate roadmap')
  }
}

async function generateTasksForPhase(
  roadmapId: string,
  phase: any,
  startDate: string
) {
  const supabase = await createClient()
  
  // Generate tasks based on the phase
  const tasks = phase.tasks.map((taskTitle: string, index: number) => {
    const taskDate = new Date(startDate)
    taskDate.setDate(taskDate.getDate() + index)
    
    return {
      roadmap_id: roadmapId,
      title: taskTitle,
      description: `Part of ${phase.title}`,
      scheduled_date: taskDate.toISOString().split('T')[0],
      estimated_duration: 30, // Default 30 minutes
      priority: 1,
    }
  })

  const { error } = await supabase
    .from('tasks')
    .insert(tasks)

  if (error) {
    console.error('Failed to create tasks:', error)
  }
}