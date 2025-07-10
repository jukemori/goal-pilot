import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, AI_MODELS } from '@/lib/ai/openai'
import { generateRoadmapPrompt, ROADMAP_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { Json } from '@/types/database'

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
      goal.current_level || 'beginner',
      goal.daily_time_commitment || 30,
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
        ai_generated_plan: roadmapData as unknown as Json,
        milestones: (roadmapData.milestones || []) as unknown as Json,
        ai_model: AI_MODELS.roadmap,
        prompt_version: 'v1',
      })
      .select()
      .single()

    if (roadmapError) {
      return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 })
    }

    // Create stage records only (no tasks initially)
    if (roadmapData.phases && roadmapData.phases.length > 0) {
      console.log(`Creating ${roadmapData.phases.length} stages for roadmap ${roadmap.id}`)
      try {
        await createLearningPhases(supabase, roadmap.id, roadmapData.phases, goal.start_date)
        console.log('Stages created successfully')
      } catch (stageError) {
        console.error('Failed to create stages:', stageError)
        // Continue anyway - stages can be created later
      }
      // Tasks will be generated on-demand per stage when user clicks "Generate Tasks"
    } else {
      console.log('No stages found in roadmap data')
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
  resources?: string[] | Record<string, unknown> | unknown
  daily_tasks?: Array<{
    title: string
    description?: string
    estimated_minutes?: number
    type?: string
  }>
  tasks?: string[]
}

async function createLearningPhases(
  supabase: Awaited<ReturnType<typeof createClient>>, // Supabase client type from external library
  roadmapId: string,
  stages: Phase[],
  startDate: string
) {
  let weekOffset = 0
  const stageRecords = []
  
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const stageStartDate = new Date(startDate)
    stageStartDate.setDate(stageStartDate.getDate() + (weekOffset * 7))
    
    const durationWeeks = stage.duration_weeks || 4
    const stageEndDate = new Date(stageStartDate)
    stageEndDate.setDate(stageEndDate.getDate() + (durationWeeks * 7) - 1)
    
    stageRecords.push({
      roadmap_id: roadmapId,
      phase_id: stage.id || `stage-${i + 1}`,
      phase_number: i + 1,
      title: stage.title,
      description: stage.description,
      duration_weeks: durationWeeks,
      skills_to_learn: stage.skills_to_learn || [],
      learning_objectives: stage.learning_objectives || [],
      key_concepts: stage.key_concepts || [],
      prerequisites: stage.prerequisites || [],
      outcomes: stage.outcomes || [],
      resources: stage.resources as Json || null,
      start_date: stageStartDate.toISOString().split('T')[0],
      end_date: stageEndDate.toISOString().split('T')[0],
      status: i === 0 ? 'active' : 'pending'
    })
    
    weekOffset += durationWeeks
  }
  
  console.log('Inserting stages:', stageRecords.length, 'stages')
  
  const { data, error } = await supabase
    .from('learning_phases')
    .insert(stageRecords)
    .select()
  
  if (error) {
    console.error('Failed to create stages:', error)
    throw error
  } else {
    console.log('Successfully created stages:', data?.length)
  }
}


