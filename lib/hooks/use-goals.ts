'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useGoals() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*, roadmaps(id)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
  })
}

export function useGoal(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select(
          `
          *,
          roadmaps (
            id,
            ai_generated_plan,
            milestones,
            created_at,
            tasks (
              id,
              title,
              description,
              scheduled_date,
              estimated_duration,
              completed,
              completed_at,
              priority
            )
          )
        `,
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase.from('goals').delete().eq('id', goalId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete goal')
    },
  })
}

export function useUpdateGoalStatus() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      status,
    }: {
      goalId: string
      status: string
    }) => {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId)

      if (error) throw error
    },
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({
        queryKey: ['goals', goalId],
      })
      toast.success('Goal status updated')
    },
    onError: () => {
      toast.error('Failed to update goal status')
    },
  })
}
