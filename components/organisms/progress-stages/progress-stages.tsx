'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Calendar,
  CheckCircle2,
  Play,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ProgressStage } from '@/types'
import { TaskGenerationDialog } from '@/components/molecules/task-generation-dialog'
import { AIGenerationOverlay } from '@/components/molecules/ai-generation-overlay'

interface StageWithTasks extends ProgressStage {
  taskCount: number
  hasGeneratedTasks: boolean
}

interface ProgressStagesProps {
  roadmapId: string
  goalId: string
}

export function ProgressStages({
  roadmapId,
  goalId: _goalId,
}: ProgressStagesProps) {
  const [generatingPhase, setGeneratingPhase] = useState<string | null>(null)
  const [hasTriggeredAutoCreate, setHasTriggeredAutoCreate] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [lastGeneratedTask, setLastGeneratedTask] = useState<{
    count: number
    stageTitle: string
  } | null>(null)
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch progress stages with task counts
  const {
    data: stages,
    isLoading,
    error,
  } = useQuery<StageWithTasks[]>({
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

  // Auto-create stages if none exist
  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/progress-stages/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create stages')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['progress-stages', roadmapId],
      })
      setHasTriggeredAutoCreate(false)
    },
  })

  // Generate tasks for a stage
  const generateTasksMutation = useMutation({
    mutationFn: async (stage: ProgressStage) => {
      console.log('Generating tasks for stage:', stage)
      const response = await fetch('/api/tasks/generate-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseId: stage.id, roadmapId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate tasks')
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      // Store the generated task info for the dialog
      setLastGeneratedTask({
        count: data.tasksCount,
        stageTitle: variables.title,
      })

      // Show the success dialog first
      setTaskDialogOpen(true)

      // Delay query invalidations to avoid re-render conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['progress-stages', roadmapId],
        })
        queryClient.invalidateQueries({ queryKey: ['tasks', roadmapId] })
        queryClient.invalidateQueries({ queryKey: ['goals'] })
      }, 100)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      setGeneratingPhase(null)
    },
  })

  // Auto-trigger stage creation if needed
  useEffect(() => {
    if (!stages || stages.length === 0) {
      if (
        !isLoading &&
        !error &&
        !autoCreateMutation.isPending &&
        !autoCreateMutation.isSuccess &&
        !hasTriggeredAutoCreate
      ) {
        setHasTriggeredAutoCreate(true)
        autoCreateMutation.mutate()
      }
    }
  }, [stages, isLoading, error, autoCreateMutation, hasTriggeredAutoCreate])

  if (isLoading || autoCreateMutation.isPending) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error loading stages: {error.message}
      </div>
    )
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No stages found</p>
        <p className="mt-2 text-sm">Stages will be created automatically.</p>
        <p className="mt-1 text-xs text-gray-400">Roadmap ID: {roadmapId}</p>
      </div>
    )
  }

  console.log(
    'Rendering stages:',
    stages.length,
    'stages for roadmap:',
    roadmapId,
  )

  return (
    <>
      <AIGenerationOverlay
        isVisible={!!generatingPhase}
        stage="tasks"
        onCancel={() => setGeneratingPhase(null)}
      />
      <div className="space-y-6">
        {stages.map((stage) => {
          const isActive = stage.status === 'active'
          const isCompleted = stage.status === 'completed'
          const hasGeneratedTasks = stage.hasGeneratedTasks

          return (
            <Card
              key={stage.id}
              className={cn(
                'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                isActive &&
                  'border-primary from-primary/5 to-primary/10 bg-gradient-to-r shadow-md',
                isCompleted &&
                  'border-green-200 bg-gradient-to-r from-green-50 to-green-100 opacity-75',
                !isActive &&
                  !isCompleted &&
                  'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              {/* Stage indicator line */}
              <div
                className={cn(
                  'absolute top-0 left-0 h-full w-1',
                  isActive && 'bg-primary',
                  isCompleted && 'bg-green-500',
                  !isActive && !isCompleted && 'bg-gray-300',
                )}
              />

              <CardHeader className="pl-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold',
                        isActive &&
                          'bg-primary/10 text-primary border-primary/20 border',
                        isCompleted &&
                          'border border-green-200 bg-green-100 text-green-700',
                        !isActive &&
                          !isCompleted &&
                          'border border-gray-200 bg-gray-100 text-gray-600',
                      )}
                    >
                      <span className="text-xs font-bold">Stage</span>
                      <span className="font-bold">{stage.phase_number}</span>
                    </div>
                    <Badge
                      variant={
                        isActive
                          ? 'default'
                          : isCompleted
                            ? 'secondary'
                            : 'outline'
                      }
                      className={cn(
                        'capitalize',
                        isActive && 'bg-primary text-white',
                        isCompleted && 'bg-green-500 text-white',
                      )}
                    >
                      {stage.status}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className="mb-2 text-xl">
                      {stage.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {stage.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pl-6">
                {/* Timeline and Duration */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {stage.duration_weeks} weeks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(
                        stage.start_date + 'T00:00:00',
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(
                        stage.end_date + 'T00:00:00',
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {stage.skills_to_learn && stage.skills_to_learn.length > 0 && (
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                      Skills to Develop:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {stage.skills_to_learn.map(
                        (skill: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-50 text-xs"
                          >
                            {skill}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Show objectives if available */}
                {stage.learning_objectives &&
                  stage.learning_objectives.length > 0 && (
                    <div className="rounded-lg border border-gray-200 p-4">
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        Objectives:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {stage.learning_objectives?.map(
                          (objective: string, index: number) => (
                            <li key={index} className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                              {objective}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {/* Show resources if available */}
                {stage.resources && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span className="h-2 w-2 rounded-full bg-green-600"></span>
                      Resources & Tools:
                    </p>
                    <div className="space-y-2">
                      {Array.isArray(stage.resources) ? (
                        stage.resources.map((resource, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 text-sm text-gray-700"
                          >
                            <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>{String(resource)}</span>
                          </div>
                        ))
                      ) : typeof stage.resources === 'object' &&
                        stage.resources !== null ? (
                        Object.entries(
                          stage.resources as Record<string, unknown>,
                        ).map(([key, value], index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 text-sm text-gray-700"
                          >
                            <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>
                              <strong>{key}:</strong> {String(value)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-start gap-3 text-sm text-gray-700">
                          <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span>{String(stage.resources)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Show key concepts if available */}
                {stage.key_concepts && stage.key_concepts.length > 0 && (
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                      Key Concepts:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {stage.key_concepts.map(
                        (concept: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-50 text-xs"
                          >
                            {concept}
                          </Badge>
                        ),
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button
                    size="sm"
                    variant={
                      hasGeneratedTasks
                        ? 'secondary'
                        : isActive
                          ? 'default'
                          : 'outline'
                    }
                    onClick={() => {
                      setGeneratingPhase(stage.id)
                      generateTasksMutation.mutate(stage)
                    }}
                    disabled={
                      generatingPhase === stage.id ||
                      isCompleted ||
                      hasGeneratedTasks
                    }
                    className="relative gap-2 overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {generatingPhase === stage.id ? (
                        <motion.div
                          key="generating"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          >
                            <Sparkles className="h-3 w-3" />
                          </motion.div>
                          <span>Generating...</span>
                        </motion.div>
                      ) : hasGeneratedTasks ? (
                        <motion.div
                          key="completed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </motion.div>
                          <span>Tasks Generated ({stage.taskCount})</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="normal"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-3 w-3" />
                          <span>Generate Tasks</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>

                  {isCompleted && (
                    <div className="text-primary flex items-center gap-1 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Stage Completed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Task Generation Success Dialog */}
        <TaskGenerationDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          taskCount={lastGeneratedTask?.count || 0}
          phaseTitle={lastGeneratedTask?.stageTitle || ''}
          onViewTasks={() => {
            setTaskDialogOpen(false)
            // Navigate to progress tab and tasks section using query parameter and hash
            const url = new URL(window.location.href)
            url.searchParams.set('tab', 'progress')
            url.hash = 'tasks-section'
            window.location.href = url.toString()
          }}
        />
      </div>
    </>
  )
}
