'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeTask(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  if (error) {
    throw new Error('Failed to complete task')
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
}

export async function uncompleteTask(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      completed: false,
      completed_at: null,
    })
    .eq('id', taskId)

  if (error) {
    throw new Error('Failed to uncomplete task')
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
}

export async function rescheduleTask(taskId: string, newDate: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Get current task to increment reschedule count
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('rescheduled_count')
    .eq('id', taskId)
    .single()

  if (fetchError || !task) {
    throw new Error('Task not found')
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      scheduled_date: newDate,
      rescheduled_count: (task.rescheduled_count || 0) + 1,
    })
    .eq('id', taskId)

  if (error) {
    throw new Error('Failed to reschedule task')
  }

  revalidatePath('/calendar')
}

export async function updateTaskDuration(
  taskId: string,
  actualDuration: number,
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      actual_duration: actualDuration,
    })
    .eq('id', taskId)

  if (error) {
    throw new Error('Failed to update task duration')
  }

  revalidatePath('/calendar')
  revalidatePath('/dashboard')
}
