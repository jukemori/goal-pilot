'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { goalFormSchema } from '@/lib/validations/goal'
import { generateRoadmapAsync } from './ai-async'
import { ensureUserProfile } from './auth'

export async function createGoal(formData: FormData) {
  const supabase = await createClient()

  // Ensure user profile exists and get user
  const user = await ensureUserProfile()

  // Parse and validate form data
  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    current_level: formData.get('current_level') as string,
    start_date: formData.get('start_date') as string,
    target_date: formData.get('target_date') as string,
    daily_time_commitment: parseInt(
      formData.get('daily_time_commitment') as string,
    ),
    weekly_schedule: JSON.parse(formData.get('weekly_schedule') as string),
  }

  const validatedData = goalFormSchema.parse(rawData)

  // Handle empty target_date - convert empty string to null
  const goalData = {
    ...validatedData,
    target_date:
      validatedData.target_date && validatedData.target_date.trim() !== ''
        ? validatedData.target_date
        : null,
  }

  console.log('Creating goal with data:', {
    user_id: user.id,
    ...goalData,
  })

  // Create the goal
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      ...goalData,
    })
    .select('*')
    .single()

  if (error || !goal) {
    console.error('Supabase error creating goal:', error)
    throw new Error(`Failed to create goal: ${error}`)
  }

  // Start AI roadmap generation asynchronously - don't wait for it
  generateRoadmapAsync(goal.id).catch((error) => {
    console.error('Background roadmap generation failed:', error)
  })

  revalidatePath('/dashboard')
  return { success: true, goalId: goal.id }
}

export async function updateGoal(goalId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    current_level: formData.get('current_level') as string,
    start_date: formData.get('start_date') as string,
    target_date: formData.get('target_date') as string,
    daily_time_commitment: parseInt(
      formData.get('daily_time_commitment') as string,
    ),
    weekly_schedule: JSON.parse(formData.get('weekly_schedule') as string),
  }

  const validatedData = goalFormSchema.parse(rawData)

  // Handle empty target_date - convert empty string to null
  const goalData = {
    ...validatedData,
    target_date:
      validatedData.target_date && validatedData.target_date.trim() !== ''
        ? validatedData.target_date
        : null,
  }

  const { error } = await supabase
    .from('goals')
    .update(goalData)
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to update goal')
  }

  revalidatePath('/dashboard')
  revalidatePath(`/goals/${goalId}`)
  return { success: true, goalId }
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('Failed to delete goal')
  }

  revalidatePath('/dashboard')
  revalidatePath('/goals')
  redirect('/goals')
}
