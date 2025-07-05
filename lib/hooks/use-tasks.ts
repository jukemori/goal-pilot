'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { completeTask, uncompleteTask, rescheduleTask, updateTaskDuration } from '@/app/actions/tasks'
import { toast } from 'sonner'

export function useTasks(date?: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['tasks', date],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          roadmaps!inner(
            goal_id,
            goals!inner(
              title,
              status
            )
          )
        `)
        .order('scheduled_date')
      
      if (date) {
        query = query.eq('scheduled_date', date)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    },
    enabled: true,
  })
}

export function useTodayTasks() {
  const today = new Date().toISOString().split('T')[0]
  return useTasks(today)
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Task completed!')
    },
    onError: () => {
      toast.error('Failed to complete task')
    },
  })
}

export function useUncompleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: uncompleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Task marked as incomplete')
    },
    onError: () => {
      toast.error('Failed to update task')
    },
  })
}

export function useRescheduleTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ taskId, newDate }: { taskId: string; newDate: string }) =>
      rescheduleTask(taskId, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task rescheduled')
    },
    onError: () => {
      toast.error('Failed to reschedule task')
    },
  })
}

export function useUpdateTaskDuration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ taskId, duration }: { taskId: string; duration: number }) =>
      updateTaskDuration(taskId, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task duration updated')
    },
    onError: () => {
      toast.error('Failed to update task duration')
    },
  })
}

export function useTasksByGoal(goalId: string) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['tasks', 'goal', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          roadmaps!inner(
            goal_id
          )
        `)
        .eq('roadmaps.goal_id', goalId)
        .order('scheduled_date')
      
      if (error) throw error
      return data
    },
    enabled: !!goalId,
  })
}