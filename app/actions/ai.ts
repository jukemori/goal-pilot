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
    goal.current_level || 'beginner',
    goal.daily_time_commitment || 30,
    goal.target_date,
    goal.weekly_schedule as Record<string, boolean>,
    goal.start_date
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
      max_tokens: 3000,
    })

    let roadmapData: RoadmapPlan & { 
      milestones: Array<{
        week: number
        title: string
        description: string
        deliverables: string[]
      }>
    }
    
    try {
      let content = completion.choices[0].message.content!
      console.log('Raw AI response length:', content.length)
      console.log('Raw AI response preview:', content.substring(0, 200) + '...')
      
      // Clean up common JSON issues
      content = content.trim()
      
      // Remove any text before the JSON starts
      const jsonStart = content.indexOf('{')
      if (jsonStart > 0) {
        content = content.substring(jsonStart)
      }
      
      // Remove any text after the JSON ends
      const jsonEnd = content.lastIndexOf('}')
      if (jsonEnd > 0 && jsonEnd < content.length - 1) {
        content = content.substring(0, jsonEnd + 1)
      }
      
      console.log('Cleaned content preview:', content.substring(0, 200) + '...')
      roadmapData = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw content:', completion.choices[0].message.content)
      throw new Error('Failed to parse AI response as JSON. The response may be incomplete or malformed.')
    }
    
    // Save the roadmap to database
    const { data: roadmap, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        goal_id: goalId,
        ai_generated_plan: roadmapData as any,
        milestones: (roadmapData.milestones || []) as any,
        ai_model: AI_MODELS.roadmap,
        prompt_version: 'v1',
      })
      .select()
      .single()

    if (roadmapError) {
      throw new Error('Failed to save roadmap')
    }

    // Generate tasks for all phases
    if (roadmapData.phases && roadmapData.phases.length > 0) {
      await generateAllTasks(roadmap.id, roadmapData.phases, goal.start_date, goal.weekly_schedule as Record<string, boolean>)
    }

    return roadmap
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate roadmap')
  }
}

async function generateAllTasks(
  roadmapId: string,
  phases: Array<{
    title: string
    daily_tasks?: Array<{
      title: string
      description?: string
      estimated_minutes?: number
      type?: string
    }>
    tasks?: string[]
  }>,
  startDate: string,
  weeklySchedule: Record<string, boolean>
) {
  const supabase = await createClient()
  
  // Get available days of the week
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => getDayNumber(day))
  
  const allTasks: Array<{
    roadmap_id: string
    title: string
    description: string
    scheduled_date: string
    estimated_duration: number
    priority: number
  }> = []
  const currentDate = new Date(startDate)
  
  // Generate tasks for all phases
  for (const phase of phases) {
    const dailyTasks = phase.daily_tasks || phase.tasks || []
    
    // If using old format (tasks array), convert to daily_tasks format
    const normalizedTasks = Array.isArray(dailyTasks) && typeof dailyTasks[0] === 'string'
      ? (dailyTasks as string[]).map((title: string, index: number) => ({
          day: index + 1,
          title,
          description: `Part of ${phase.title}`,
          estimated_minutes: 30,
          type: 'practice'
        }))
      : (dailyTasks as Array<{
          title: string
          description?: string
          estimated_minutes?: number
          type?: string
        }>)
    
    // Generate tasks for this phase
    for (const dailyTask of normalizedTasks) {
      // Find next available day
      while (!availableDays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      allTasks.push({
        roadmap_id: roadmapId,
        title: dailyTask.title,
        description: dailyTask.description || `Part of ${phase.title}`,
        scheduled_date: currentDate.toISOString().split('T')[0],
        estimated_duration: dailyTask.estimated_minutes || 30,
        priority: getPriorityFromType(dailyTask.type || 'practice'),
      })
      
      // Move to next available day
      do {
        currentDate.setDate(currentDate.getDate() + 1)
      } while (!availableDays.includes(currentDate.getDay()))
    }
  }

  // Insert all tasks
  if (allTasks.length > 0) {
    const { error } = await supabase
      .from('tasks')
      .insert(allTasks)

    if (error) {
      console.error('Failed to create tasks:', error)
    } else {
      console.log(`Generated ${allTasks.length} tasks for roadmap`)
    }
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
    saturday: 6
  }
  return dayMap[dayName.toLowerCase()] ?? 1
}

function getPriorityFromType(type: string): number {
  const priorityMap: Record<string, number> = {
    study: 5,
    practice: 4,
    exercise: 3,
    review: 2
  }
  return priorityMap[type] || 3
}