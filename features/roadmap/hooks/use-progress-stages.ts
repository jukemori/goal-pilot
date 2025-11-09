'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ProgressStage } from '@/types'

interface StageWithTasks extends ProgressStage {
  taskCount: number
  hasGeneratedTasks: boolean
}

export function useProgressStages(roadmapId: string) {
  const supabase = createClient()

  return useQuery<StageWithTasks[]>({
    queryKey: ['progress-stages', roadmapId],
    queryFn: async () => {
      console.log('Fetching stages for roadmap:', roadmapId)

      // Get stages first
      const { data: stagesData, error: stagesError } = await supabase
        .from('progress_stages')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('phase_number')

      if (stagesError) {
        console.error('Error fetching stages:', stagesError)
        throw stagesError
      }

      if (!stagesData || stagesData.length === 0) {
        return []
      }

      // Get task counts for all stages in a single query using OR conditions
      const stageIds = stagesData.map((p) => p.phase_id)
      const { data: taskCounts } = await supabase
        .from('tasks')
        .select('phase_id')
        .eq('roadmap_id', roadmapId)
        .in('phase_id', stageIds)

      // Count tasks per stage
      const taskCountMap = new Map<string, number>()
      taskCounts?.forEach((task) => {
        if (task.phase_id) {
          const count = taskCountMap.get(task.phase_id) || 0
          taskCountMap.set(task.phase_id, count + 1)
        }
      })

      // Transform the data to include task counts
      const stagesWithTaskCounts = stagesData.map((stage: ProgressStage) => {
        const taskCount = taskCountMap.get(stage.phase_id || '') || 0
        return {
          ...stage,
          taskCount,
          hasGeneratedTasks: taskCount > 0,
        }
      })

      console.log('Stages with task counts:', stagesWithTaskCounts)
      return stagesWithTaskCounts
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}
