import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateTasksForPhasePrompt, TASK_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { phaseId, roadmapId } = await request.json()
    
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the learning phase details
    const { data: phase, error: phaseError } = await supabase
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

    if (phaseError || !phase) {
      return NextResponse.json({ error: 'Phase not found' }, { status: 404 })
    }

    // Check if tasks already exist for this phase
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('roadmap_id', roadmapId)
      .eq('phase_id', phase.phase_id)
      .limit(1)

    if (existingTasks && existingTasks.length > 0) {
      return NextResponse.json({ 
        message: 'Tasks already generated for this phase',
        tasksCount: existingTasks.length 
      })
    }

    // Extract phase data from the roadmap
    const phases = phase.roadmaps.ai_generated_plan.phases as any[]
    const phaseData = phases.find((p: any) => p.id === phase.phase_id) || phases[phase.phase_number - 1]
    
    if (!phaseData) {
      return NextResponse.json({ error: 'Phase data not found in roadmap' }, { status: 404 })
    }

    // Get goal details for context
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('title, daily_time_commitment')
      .eq('id', phase.roadmaps.goal_id)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Generate tasks using AI
    const weeklySchedule = phase.roadmaps.goals.weekly_schedule as Record<string, boolean>
    
    const prompt = generateTasksForPhasePrompt(
      phaseData.title,
      phaseData.description,
      phaseData.skills_to_learn || [],
      phaseData.learning_objectives || [],
      phaseData.key_concepts || [],
      phase.duration_weeks,
      goal.daily_time_commitment,
      weeklySchedule,
      phase.phase_number,
      goal.title
    )

    console.log('Generating tasks with AI for phase:', phase.title)
    
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

    let taskData
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
      
      taskData = JSON.parse(content)
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
    let currentDate = createConsistentDate(phase.start_date)
    const endDate = createConsistentDate(phase.end_date)
    
    console.log('Phase start date:', phase.start_date, '-> Current date:', currentDate, 'Day of week:', currentDate.getDay())
    console.log('Phase end date:', phase.end_date, '-> End date:', endDate)
    
    // Use new pattern-based approach or fallback to old format
    const taskPatterns = taskData.task_patterns || []
    const dailyTasks = taskData.daily_tasks || []

    // For now, use a simple approach to ensure full coverage
    // Generate tasks for the entire phase duration
    const basicTasks = [
      { title: 'Practice Spanish vocabulary', type: 'practice', description: 'Study and practice new Spanish words and phrases' },
      { title: 'Study Spanish grammar', type: 'study', description: 'Learn and understand Spanish grammar rules' },
      { title: 'Listen to Spanish audio', type: 'exercise', description: 'Listen to Spanish podcasts, music, or conversations' },
      { title: 'Practice Spanish pronunciation', type: 'practice', description: 'Practice speaking Spanish words and sentences' },
      { title: 'Review Spanish lessons', type: 'review', description: 'Review previous lessons and practice materials' }
    ]
    
    let taskIndex = 0
    
    while (currentDate <= endDate) {
      // Find next available day
      while (!availableDays.includes(currentDate.getDay())) {
        currentDate.setDate(currentDate.getDate() + 1)
        if (currentDate > endDate) break
      }
      
      if (currentDate > endDate) break
      
      const weekNumber = Math.floor((currentDate.getTime() - createConsistentDate(phase.start_date).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
      const baseTask = basicTasks[taskIndex % basicTasks.length]
      
      tasks.push({
        roadmap_id: roadmapId,
        title: `${baseTask.title} (Week ${weekNumber})`,
        description: `${baseTask.description} - Part of ${phaseData.title}`,
        scheduled_date: currentDate.toISOString().split('T')[0],
        estimated_duration: goal.daily_time_commitment,
        priority: getPriorityFromType(baseTask.type),
        phase_id: phase.phase_id,
        phase_number: phase.phase_number
      })
      
      // Move to next available day
      do {
        currentDate.setDate(currentDate.getDate() + 1)
      } while (!availableDays.includes(currentDate.getDay()) && currentDate <= endDate)
      
      taskIndex++
    }
    
    console.log(`Generated ${tasks.length} tasks for phase: ${phase.title}`)
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
    console.error('Error generating phase tasks:', error)
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

// Helper function to create consistent local dates from date strings
function createConsistentDate(dateString: string): Date {
  // Parse the date string as YYYY-MM-DD and create a date without timezone issues
  // This ensures the date represents the intended calendar date regardless of server timezone
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
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

function getDifficultyLevel(weekInPattern: number): string {
  if (weekInPattern <= 1) return 'basic'
  if (weekInPattern <= 2) return 'intermediate'
  if (weekInPattern <= 3) return 'advanced'
  return 'mastery'
}