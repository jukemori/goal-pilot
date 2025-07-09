'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, CheckCircle2, Play, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { LearningPhase } from '@/types'
import { TaskGenerationDialog } from '@/components/molecules/task-generation-dialog'

interface LearningPhaseWithTasks extends LearningPhase {
  taskCount: number
  hasGeneratedTasks: boolean
}

interface LearningPhasesProps {
  roadmapId: string
  goalId: string
}

export function LearningPhases({ roadmapId, goalId: _goalId }: LearningPhasesProps) {
  const [generatingPhase, setGeneratingPhase] = useState<string | null>(null)
  const [hasTriggeredAutoCreate, setHasTriggeredAutoCreate] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [lastGeneratedTask, setLastGeneratedTask] = useState<{ count: number; phaseTitle: string } | null>(null)
  const queryClient = useQueryClient()
  const supabase = createClient()

  // Fetch learning phases with task counts
  const { data: phases, isLoading, error } = useQuery<LearningPhaseWithTasks[]>({
    queryKey: ['learning-phases', roadmapId],
    queryFn: async () => {
      console.log('Fetching learning phases for roadmap:', roadmapId)
      
      // Get phases first
      const { data: phasesData, error: phasesError } = await supabase
        .from('learning_phases')
        .select('*')
        .eq('roadmap_id', roadmapId)
        .order('phase_number')

      if (phasesError) {
        console.error('Error fetching learning phases:', phasesError)
        throw phasesError
      }

      if (!phasesData || phasesData.length === 0) {
        return []
      }

      // Get task counts for all phases in a single query using OR conditions
      const phaseIds = phasesData.map(p => p.phase_id)
      const { data: taskCounts } = await supabase
        .from('tasks')
        .select('phase_id')
        .eq('roadmap_id', roadmapId)
        .in('phase_id', phaseIds)

      // Count tasks per phase
      const taskCountMap = new Map<string, number>()
      taskCounts?.forEach(task => {
        if (task.phase_id) {
          const count = taskCountMap.get(task.phase_id) || 0
          taskCountMap.set(task.phase_id, count + 1)
        }
      })

      // Transform the data to include task counts
      const phasesWithTaskCounts = phasesData.map((phase: LearningPhase) => {
        const taskCount = taskCountMap.get(phase.phase_id || '') || 0
        return {
          ...phase,
          taskCount,
          hasGeneratedTasks: taskCount > 0
        }
      })

      console.log('Learning phases with task counts:', phasesWithTaskCounts)
      return phasesWithTaskCounts
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  // Auto-create phases if none exist
  const autoCreateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/learning-phases/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadmapId })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create learning phases')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-phases', roadmapId] })
      setHasTriggeredAutoCreate(false)
    }
  })

  // Generate tasks for a phase
  const generateTasksMutation = useMutation({
    mutationFn: async (phase: LearningPhase) => {
      console.log('Generating tasks for phase:', phase)
      const response = await fetch('/api/tasks/generate-phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phaseId: phase.id, roadmapId })
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
        phaseTitle: variables.title
      })
      
      // Show the success dialog first
      setTaskDialogOpen(true)
      
      // Delay query invalidations to avoid re-render conflicts
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['learning-phases', roadmapId] })
        queryClient.invalidateQueries({ queryKey: ['tasks', roadmapId] })
        queryClient.invalidateQueries({ queryKey: ['goals'] })
      }, 100)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
    onSettled: () => {
      setGeneratingPhase(null)
    }
  })


  // Auto-trigger phase creation if needed
  useEffect(() => {
    if (!phases || phases.length === 0) {
      if (!isLoading && !error && !autoCreateMutation.isPending && !autoCreateMutation.isSuccess && !hasTriggeredAutoCreate) {
        setHasTriggeredAutoCreate(true)
        autoCreateMutation.mutate()
      }
    }
  }, [phases, isLoading, error, autoCreateMutation, hasTriggeredAutoCreate])

  if (isLoading || autoCreateMutation.isPending) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg" />
      ))}
    </div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">
      Error loading learning phases: {error.message}
    </div>
  }

  if (!phases || phases.length === 0) {
    return <div className="text-center py-8 text-gray-500">
      <p>No learning phases found</p>
      <p className="text-sm mt-2">Learning phases will be created automatically.</p>
      <p className="text-xs mt-1 text-gray-400">Roadmap ID: {roadmapId}</p>
    </div>
  }

  console.log('Rendering phases:', phases.length, 'phases for roadmap:', roadmapId)

  return (
    <div className="space-y-6">
      {phases.map((phase) => {
        const isActive = phase.status === 'active'
        const isCompleted = phase.status === 'completed'
        const hasGeneratedTasks = phase.hasGeneratedTasks
        
        return (
          <Card 
            key={phase.id}
            className={cn(
              "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
              isActive && "border-primary shadow-md bg-gradient-to-r from-primary/5 to-primary/10",
              isCompleted && "opacity-75 bg-gradient-to-r from-green-50 to-green-100 border-green-200",
              !isActive && !isCompleted && "bg-white border-gray-200 hover:border-gray-300"
            )}
          >
            {/* Phase indicator line */}
            <div className={cn(
              "absolute left-0 top-0 w-1 h-full",
              isActive && "bg-primary",
              isCompleted && "bg-green-500",
              !isActive && !isCompleted && "bg-gray-300"
            )} />
            
            <CardHeader className="pl-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold",
                    isActive && "bg-primary/10 text-primary border border-primary/20",
                    isCompleted && "bg-green-100 text-green-700 border border-green-200",
                    !isActive && !isCompleted && "bg-gray-100 text-gray-600 border border-gray-200"
                  )}>
                    <span className="text-xs font-bold">Phase</span>
                    <span className="font-bold">{phase.phase_number}</span>
                  </div>
                  <Badge 
                    variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                    className={cn(
                      "capitalize",
                      isActive && "bg-primary text-white",
                      isCompleted && "bg-green-500 text-white"
                    )}
                  >
                    {phase.status}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">{phase.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{phase.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pl-6">
              {/* Timeline and Duration */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{phase.duration_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    {new Date(phase.start_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short', 
                      day: 'numeric'
                    })} - {new Date(phase.end_date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {phase.skills_to_learn && phase.skills_to_learn.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                    Skills to Learn:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills_to_learn.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Show learning objectives if available */}
              {phase.learning_objectives && phase.learning_objectives.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold mb-3 text-green-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Learning Objectives:
                  </p>
                  <ul className="text-sm text-green-800 space-y-2">
                    {phase.learning_objectives?.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show resources if available */}
              {phase.resources && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold mb-3 text-blue-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Resources & Tools:
                  </p>
                  <div className="space-y-2">
                    {Array.isArray(phase.resources) ? (
                      phase.resources.map((resource, index: number) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-blue-800">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{String(resource)}</span>
                        </div>
                      ))
                    ) : typeof phase.resources === 'object' && phase.resources !== null ? (
                      Object.entries(phase.resources as Record<string, unknown>).map(([key, value], index) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-blue-800">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                          <span><strong>{key}:</strong> {String(value)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start gap-3 text-sm text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>{String(phase.resources)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show key concepts if available */}
              {phase.key_concepts && phase.key_concepts.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                    Key Concepts:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {phase.key_concepts.map((concept: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant={hasGeneratedTasks ? "secondary" : (isActive ? "default" : "outline")}
                  onClick={() => {
                    setGeneratingPhase(phase.id)
                    generateTasksMutation.mutate(phase)
                  }}
                  disabled={generatingPhase === phase.id || isCompleted || hasGeneratedTasks}
                  className="gap-2 relative overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {generatingPhase === phase.id ? (
                      <motion.div
                        key="generating"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </motion.div>
                        <span>Tasks Generated ({phase.taskCount})</span>
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
                  <div className="flex items-center gap-1 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Phase Completed
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
        phaseTitle={lastGeneratedTask?.phaseTitle || ''}
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
  )
}