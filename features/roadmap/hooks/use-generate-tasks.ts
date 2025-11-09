'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ProgressStage } from '@/types'

export function useGenerateTasks(roadmapId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stage: ProgressStage) => {
      console.log('Generating tasks for stage:', stage)
      const response = await fetch('/api/tasks/generate-phase-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId: stage.id,
          roadmapId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate tasks')
      }

      return response.json()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
    onSuccess: () => {
      // Delay query invalidations to avoid re-render conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['progress-stages', roadmapId],
        })
        queryClient.invalidateQueries({
          queryKey: ['tasks', roadmapId],
        })
        queryClient.invalidateQueries({
          queryKey: ['goals'],
        })
      }, 100)
    },
  })
}
