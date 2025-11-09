'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import {
  completeTask,
  uncompleteTask,
  rescheduleTask,
  updateTaskDuration,
} from '@/app/actions/tasks'
import { toast } from 'sonner'
import type { Task } from '@/types/database'

// Type for task with roadmap relations from database query
export type TaskWithRoadmap = {
  id: string
  title: string
  description: string | null
  scheduled_date: string
  estimated_duration: number | null
  completed: boolean | null
  completed_at: string | null
  priority: number | null
  roadmaps: {
    goal_id: string
    goals: {
      title: string
      status: string
    }
  }
}

export function useTasks(date?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tasks', date],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(
          `
          *,
          roadmaps!inner(
            goal_id,
            goals!inner(
              title,
              status
            )
          )
        `,
        )
        .order('scheduled_date')

      if (date) {
        query = query.eq('scheduled_date', date)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds - tasks change frequently (completion, rescheduling)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to ensure fresh task status
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
    onMutate: async (taskId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['tasks'],
      })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks'])

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: Task[] | undefined) => {
          if (!old) return old
          return old.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: true,
                  completed_at: new Date().toISOString(),
                }
              : task,
          )
        },
      )

      return { previousTasks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Task completed!')
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context?.previousTasks)
      toast.error('Failed to complete task')
    },
  })
}

export function useUncompleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uncompleteTask,
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({
        queryKey: ['tasks'],
      })

      const previousTasks = queryClient.getQueryData(['tasks'])

      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: Task[] | undefined) => {
          if (!old) return old
          return old.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: false,
                  completed_at: null,
                }
              : task,
          )
        },
      )

      return { previousTasks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Task marked as incomplete')
    },
    onError: (err, taskId, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks)
      toast.error('Failed to update task')
    },
  })
}

export function useRescheduleTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, newDate }: { taskId: string; newDate: string }) =>
      rescheduleTask(taskId, newDate),
    onMutate: async ({ taskId, newDate }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot previous values
      const previousTasks = queryClient.getQueryData(['tasks'])

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: Task[] | undefined) => {
          if (!old) return old
          return old.map((task) =>
            task.id === taskId
              ? { ...task, scheduled_date: newDate }
              : task,
          )
        },
      )

      return { previousTasks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task rescheduled')
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context?.previousTasks)
      toast.error('Failed to reschedule task')
    },
  })
}

export function useUpdateTaskDuration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, duration }: { taskId: string; duration: number }) =>
      updateTaskDuration(taskId, duration),
    onMutate: async ({ taskId, duration }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // Snapshot previous values
      const previousTasks = queryClient.getQueryData(['tasks'])

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: ['tasks'] },
        (old: Task[] | undefined) => {
          if (!old) return old
          return old.map((task) =>
            task.id === taskId
              ? { ...task, estimated_duration: duration }
              : task,
          )
        },
      )

      return { previousTasks }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task duration updated')
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context?.previousTasks)
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
        .select(
          `
          *,
          roadmaps!inner(
            goal_id
          )
        `,
        )
        .eq('roadmaps.goal_id', goalId)
        .order('scheduled_date')

      if (error) throw error
      return data
    },
    enabled: !!goalId,
  })
}

// Optimized unified calendar tasks hook
export function useOptimizedCalendarTasks(currentDate: Date) {
  const supabase = createClient()

  return useQuery({
    queryKey: [
      'calendar-optimized',
      currentDate.getFullYear(),
      currentDate.getMonth(),
    ],
    queryFn: async () => {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      )
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      )

      // Single query with proper joins and indexing
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          id, title, description, scheduled_date, estimated_duration, 
          completed, completed_at, priority,
          roadmaps!inner(goal_id, goals!inner(title, status))
        `,
        )
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .order('scheduled_date')
        .order('priority', { ascending: false })

      if (error) throw error
      return (data as TaskWithRoadmap[]) || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data: TaskWithRoadmap[]) => {
      // Transform data once in React Query select
      const today = new Date().toISOString().split('T')[0]
      const tasksByDate = data.reduce(
        (acc, task) => {
          const date = task.scheduled_date
          if (!acc[date]) acc[date] = []
          acc[date].push(task)
          return acc
        },
        {} as Record<string, TaskWithRoadmap[]>,
      )

      return {
        allTasks: data,
        todayTasks: data.filter((task) => task.scheduled_date === today),
        tasksByDate,
      }
    },
  })
}
