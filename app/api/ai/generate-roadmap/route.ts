import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateRoadmapPrompt, ROADMAP_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { goalId } = await request.json()
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the goal details
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Generate the roadmap using OpenAI
    const prompt = generateRoadmapPrompt(
      goal.title,
      goal.current_level,
      goal.daily_time_commitment,
      goal.target_date,
      goal.weekly_schedule as Record<string, boolean>,
      goal.start_date
    )

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

    let roadmapData
    
    try {
      let content = completion.choices[0].message.content!
      console.log('API - Raw AI response length:', content.length)
      
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
      
      roadmapData = JSON.parse(content)
    } catch (parseError) {
      console.error('API - JSON parsing error:', parseError)
      console.error('API - Raw content:', completion.choices[0].message.content)
      return NextResponse.json({ error: 'Failed to parse AI response as JSON' }, { status: 500 })
    }
    
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
      return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 })
    }

    // Create learning phase records only (no tasks initially)
    if (roadmapData.phases && roadmapData.phases.length > 0) {
      console.log(`Creating ${roadmapData.phases.length} learning phases for roadmap ${roadmap.id}`)
      try {
        await createLearningPhases(supabase, roadmap.id, roadmapData.phases, goal.start_date)
        console.log('Learning phases created successfully')
      } catch (phaseError) {
        console.error('Failed to create learning phases:', phaseError)
        // Continue anyway - phases can be created later
      }
      // Tasks will be generated on-demand per phase when user clicks "Generate Tasks"
    } else {
      console.log('No phases found in roadmap data')
    }

    return NextResponse.json(roadmap)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 })
  }
}

interface Phase {
  id?: string
  title: string
  description: string
  duration_weeks?: number
  skills_to_learn?: string[]
  learning_objectives?: string[]
  key_concepts?: string[]
  prerequisites?: string[]
  outcomes?: string[]
  daily_tasks?: any[]
  tasks?: any[]
}

async function createLearningPhases(
  supabase: any,
  roadmapId: string,
  phases: Phase[],
  startDate: string
) {
  let weekOffset = 0
  const learningPhases = []
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i]
    const phaseStartDate = new Date(startDate)
    phaseStartDate.setDate(phaseStartDate.getDate() + (weekOffset * 7))
    
    const durationWeeks = phase.duration_weeks || 4
    const phaseEndDate = new Date(phaseStartDate)
    phaseEndDate.setDate(phaseEndDate.getDate() + (durationWeeks * 7) - 1)
    
    learningPhases.push({
      roadmap_id: roadmapId,
      phase_id: phase.id || `phase-${i + 1}`,
      phase_number: i + 1,
      title: phase.title,
      description: phase.description,
      duration_weeks: durationWeeks,
      skills_to_learn: phase.skills_to_learn || [],
      learning_objectives: phase.learning_objectives || [],
      key_concepts: phase.key_concepts || [],
      prerequisites: phase.prerequisites || [],
      outcomes: phase.outcomes || [],
      start_date: phaseStartDate.toISOString().split('T')[0],
      end_date: phaseEndDate.toISOString().split('T')[0],
      status: i === 0 ? 'active' : 'pending'
    })
    
    weekOffset += durationWeeks
  }
  
  console.log('Inserting learning phases:', learningPhases.length, 'phases')
  
  const { data, error } = await supabase
    .from('learning_phases')
    .insert(learningPhases)
    .select()
  
  if (error) {
    console.error('Failed to create learning phases:', error)
    throw error
  } else {
    console.log('Successfully created learning phases:', data?.length)
  }
}

async function generateAllTasksForAPI(
  supabase: any,
  roadmapId: string,
  phases: Phase[],
  startDate: string,
  weeklySchedule: Record<string, boolean>
) {
  // Get available days of the week
  const availableDays = Object.entries(weeklySchedule)
    .filter(([_, available]) => available)
    .map(([day]) => getDayNumber(day))
  
  const allTasks: any[] = []
  let currentDate = new Date(startDate)
  
  // Generate tasks for all phases
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
    const phase = phases[phaseIndex]
    const phaseId = phase.id || `phase-${phaseIndex + 1}`
    const dailyTasks = phase.daily_tasks || phase.tasks || []
    
    // If using old format (tasks array), convert to daily_tasks format
    const normalizedTasks = Array.isArray(dailyTasks) && typeof dailyTasks[0] === 'string'
      ? dailyTasks.map((title: string, index: number) => ({
          day: index + 1,
          title,
          description: `Part of ${phase.title}`,
          estimated_minutes: 30,
          type: 'practice'
        }))
      : dailyTasks
    
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
        priority: getPriorityFromType(dailyTask.type),
        phase_id: phaseId,
        phase_number: phaseIndex + 1
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