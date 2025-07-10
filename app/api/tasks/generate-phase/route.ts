import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateTasksForPhasePrompt, TASK_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { Json } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const { phaseId, roadmapId } = await request.json()
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the stage details
    const { data: stage, error: stageError } = await supabase
      .from('learning_phases')
      .select(`
        *,
        roadmaps!inner(
          goal_id,
          ai_generated_plan,
          goals!inner(
            user_id,
            weekly_schedule
          )
        )
      `)
      .eq('id', phaseId)
      .eq('roadmaps.goals.user_id', user.id)
      .single()

    if (stageError || !stage) {
      return NextResponse.json({ error: 'Stage not found' }, { status: 404 })
    }

    // Check if tasks already exist for this stage
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('roadmap_id', roadmapId)
      .eq('phase_id', stage.phase_id)
      .limit(1)

    if (existingTasks && existingTasks.length > 0) {
      return NextResponse.json({ 
        message: 'Tasks already generated for this stage',
        tasksCount: existingTasks.length 
      })
    }

    // Extract stage data from the roadmap - cast to Json then parse
    const aiPlan = stage.roadmaps.ai_generated_plan as Json
    const planData = aiPlan as { phases?: Array<{ 
      id?: string; 
      title: string; 
      description?: string; 
      skills_to_learn?: string[];
      learning_objectives?: string[];
      key_concepts?: string[];
    }> }
    const stages = planData?.phases || []
    const stageData = stages.find((p) => p.id === stage.phase_id) || stages[stage.phase_number - 1]
    
    if (!stageData) {
      return NextResponse.json({ error: 'Stage data not found in roadmap' }, { status: 404 })
    }

    // Get goal details for context
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('title, daily_time_commitment')
      .eq('id', stage.roadmaps.goal_id || '')
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Generate tasks using AI
    const weeklySchedule = stage.roadmaps.goals.weekly_schedule as Record<string, boolean>
    
    const prompt = generateTasksForPhasePrompt(
      stageData.title,
      stageData.description || 'Stage',
      stageData.skills_to_learn || [],
      stageData.learning_objectives || [],
      stageData.key_concepts || [],
      stage.duration_weeks || 1,
      goal.daily_time_commitment || 30,
      weeklySchedule,
      stage.phase_number,
      goal.title
    )

    console.log('Generating tasks with AI for stage:', stage.title)
    
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.roadmap,
      messages: [
        { role: 'system', content: TASK_GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000, // Maximum supported by the model
    })

    // let _taskData
    try {
      let content = completion.choices[0].message.content!
      console.log('AI task generation response length:', content.length)
      
      // Clean up JSON response
      content = content.trim()
      const jsonStart = content.indexOf('{')
      if (jsonStart > 0) {
        content = content.substring(jsonStart)
      }
      const jsonEnd = content.lastIndexOf('}')
      if (jsonEnd > 0 && jsonEnd < content.length - 1) {
        content = content.substring(0, jsonEnd + 1)
      }
      
      // _taskData = JSON.parse(content) // AI generated data not currently used
    } catch (parseError) {
      console.error('Failed to parse AI task generation response:', parseError)
      return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 })
    }

    // Schedule the generated tasks using pattern-based approach
    const availableDays = Object.entries(weeklySchedule)
      .filter(([_, available]) => available)
      .map(([day]) => getDayNumber(day))
    
    console.log('Available days (0=Sun, 1=Mon, etc):', availableDays)
    console.log('Weekly schedule:', weeklySchedule)

    const tasks = []
    // Create dates consistently to ensure correct weekday calculation
    const currentDate = createConsistentDate(stage.start_date || new Date().toISOString())
    const endDate = createConsistentDate(stage.end_date || new Date().toISOString())
    
    console.log('Stage start date:', stage.start_date, '-> Current date:', currentDate, 'Day of week:', currentDate.getUTCDay())
    console.log('Stage end date:', stage.end_date, '-> End date:', endDate)

    // For now, use a simple approach to ensure full coverage
    // Generate tasks for the entire stage duration
    const basicTasks = [
      { title: 'Practice vocabulary', type: 'practice', description: 'Study and practice new words and phrases' },
      { title: 'Study concepts', type: 'study', description: 'Learn and understand key concepts' },
      { title: 'Apply knowledge', type: 'exercise', description: 'Apply what you have learned in practical exercises' },
      { title: 'Practice skills', type: 'practice', description: 'Practice and refine your skills' },
      { title: 'Review progress', type: 'review', description: 'Review previous lessons and practice materials' }
    ]
    
    let taskIndex = 0
    
    while (currentDate <= endDate) {
      // Find next available day using UTC methods
      while (!availableDays.includes(currentDate.getUTCDay())) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
        if (currentDate > endDate) break
      }
      
      if (currentDate > endDate) break
      
      const baseTask = basicTasks[taskIndex % basicTasks.length]
      
      tasks.push({
        roadmap_id: roadmapId,
        title: baseTask.title,
        description: baseTask.description,
        scheduled_date: currentDate.toISOString().split('T')[0],
        estimated_duration: goal.daily_time_commitment || 30,
        priority: getPriorityFromType(baseTask.type),
        phase_id: stage.phase_id,
        phase_number: stage.phase_number
      })
      
      // Move to next available day using UTC methods
      do {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      } while (!availableDays.includes(currentDate.getUTCDay()) && currentDate <= endDate)
      
      taskIndex++
    }
    
    console.log(`Generated ${tasks.length} tasks for stage: ${stage.title}`)
    console.log(`Date range: ${tasks[0]?.scheduled_date} to ${tasks[tasks.length-1]?.scheduled_date}`)

    // Insert tasks
    if (tasks.length > 0) {
      const { error } = await supabase
        .from('tasks')
        .insert(tasks)

      if (error) {
        console.error('Failed to create tasks:', error)
        return NextResponse.json({ error: 'Failed to create tasks' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: 'Tasks generated successfully',
      tasksCount: tasks.length 
    })
  } catch (error) {
    console.error('Error generating stage tasks:', error)
    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 })
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

// Helper function to create consistent UTC dates from date strings
function createConsistentDate(dateString: string): Date {
  // Parse the date string as YYYY-MM-DD and create a UTC date
  // This ensures the date represents the intended calendar date consistently
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
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

