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
      max_tokens: 2000,
    })

    const roadmapData = JSON.parse(completion.choices[0].message.content!)
    
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

    // Generate initial tasks for the first phase
    if (roadmapData.phases && roadmapData.phases.length > 0) {
      const tasks = roadmapData.phases[0].tasks?.slice(0, 7).map((taskTitle: string, index: number) => {
        const taskDate = new Date(goal.start_date)
        taskDate.setDate(taskDate.getDate() + index)
        
        return {
          roadmap_id: roadmap.id,
          title: taskTitle,
          description: `Part of ${roadmapData.phases[0].title}`,
          scheduled_date: taskDate.toISOString().split('T')[0],
          estimated_duration: 30,
          priority: 1,
        }
      }) || []

      if (tasks.length > 0) {
        await supabase.from('tasks').insert(tasks)
      }
    }

    return NextResponse.json(roadmap)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 })
  }
}