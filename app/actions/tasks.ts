'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/actions'
import { logger } from '@/lib/utils/logger'

export async function completeTask(
  taskId: string,
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to complete a task',
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) {
      logger.error('Failed to complete task', { error, taskId })
      return {
        success: false,
        error: 'Failed to complete task. Please try again.',
      }
    }

    revalidatePath('/calendar')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    logger.error('Unexpected error in completeTask', { error, taskId })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function uncompleteTask(
  taskId: string,
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to uncomplete a task',
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        completed: false,
        completed_at: null,
      })
      .eq('id', taskId)

    if (error) {
      logger.error('Failed to uncomplete task', { error, taskId })
      return {
        success: false,
        error: 'Failed to uncomplete task. Please try again.',
      }
    }

    revalidatePath('/calendar')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    logger.error('Unexpected error in uncompleteTask', { error, taskId })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function rescheduleTask(
  taskId: string,
  newDate: string,
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to reschedule a task',
      }
    }

    // Get current task to increment reschedule count
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('rescheduled_count')
      .eq('id', taskId)
      .single()

    if (fetchError || !task) {
      return {
        success: false,
        error: 'Task not found',
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        scheduled_date: newDate,
        rescheduled_count: (task.rescheduled_count || 0) + 1,
      })
      .eq('id', taskId)

    if (error) {
      logger.error('Failed to reschedule task', { error, taskId, newDate })
      return {
        success: false,
        error: 'Failed to reschedule task. Please try again.',
      }
    }

    revalidatePath('/calendar')
    return { success: true, data: undefined }
  } catch (error) {
    logger.error('Unexpected error in rescheduleTask', { error, taskId, newDate })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function updateTaskDuration(
  taskId: string,
  actualDuration: number,
): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'You must be logged in to update task duration',
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        actual_duration: actualDuration,
      })
      .eq('id', taskId)

    if (error) {
      logger.error('Failed to update task duration', { error, taskId, actualDuration })
      return {
        success: false,
        error: 'Failed to update task duration. Please try again.',
      }
    }

    revalidatePath('/calendar')
    revalidatePath('/dashboard')
    return { success: true, data: undefined }
  } catch (error) {
    logger.error('Unexpected error in updateTaskDuration', { error, taskId, actualDuration })
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}
