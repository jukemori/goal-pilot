'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { goalFormSchema } from '@/lib/validations/goal'
import { generateRoadmapAsync } from './ai-async'
import { ensureUserProfile } from './auth'
import type { ActionResult } from '@/types/actions'
import { logger } from '@/lib/utils/logger'

export async function createGoal(
  formData: FormData,
): Promise<ActionResult<{ goalId: string }>> {
  try {
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

    const validationResult = goalFormSchema.safeParse(rawData)

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message || 'Invalid form data',
      }
    }

    const validatedData = validationResult.data

    // Handle empty target_date - convert empty string to null
    const goalData = {
      ...validatedData,
      target_date:
        validatedData.target_date && validatedData.target_date.trim() !== ''
          ? validatedData.target_date
          : null,
    }

    logger.debug('Creating goal', {
      userId: user.id,
      title: goalData.title,
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
      logger.error('Failed to create goal', { error })
      return {
        success: false,
        error: 'Failed to create goal. Please try again.',
      }
    }

    // Start AI roadmap generation asynchronously - don't wait for it
    generateRoadmapAsync(goal.id).catch((error) => {
      logger.error('Background roadmap generation failed', {
        error,
        goalId: goal.id,
      })
    })

    revalidatePath('/dashboard')
    return { success: true, data: { goalId: goal.id } }
  } catch (error) {
    logger.error('Unexpected error in createGoal', { error })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function updateGoal(
  goalId: string,
  formData: FormData,
): Promise<ActionResult<{ goalId: string }>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to update a goal',
      }
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

    const validationResult = goalFormSchema.safeParse(rawData)

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message || 'Invalid form data',
      }
    }

    const validatedData = validationResult.data

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
      logger.error('Failed to update goal', { error, goalId })
      return {
        success: false,
        error: 'Failed to update goal. Please try again.',
      }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/goals/${goalId}`)
    return { success: true, data: { goalId } }
  } catch (error) {
    logger.error('Unexpected error in updateGoal', { error, goalId })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function deleteGoal(goalId: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete a goal',
      }
    }

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete goal', { error, goalId })
      return {
        success: false,
        error: 'Failed to delete goal. Please try again.',
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/goals')
    redirect('/goals')
  } catch (error) {
    logger.error('Unexpected error in deleteGoal', { error, goalId })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
